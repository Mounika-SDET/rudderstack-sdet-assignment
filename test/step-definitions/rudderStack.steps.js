const { Given, When, Then } = require('@wdio/cucumber-framework');
const {updateEnvFile} = require('../utils/envHelper.js');
const LoginPage = require('../pages/login.page.js');
const ConnectionsPage = require('../pages/connections.page.js');
const { sendTrackEvent } = require('../utils/apiClient.js');
require('dotenv').config();

const context = {};

Given('I log in to RudderStack', async function () {
  await LoginPage.open();
  await LoginPage.login(process.env.DEV_EMAIL, process.env.DEV_PASSWORD);
  await browser.pause(5000)
});

Given('I navigate to the Connections page', async function () {
  await ConnectionsPage.moveToConnectionsPage();
});

Given('I capture the Data Plane URL', async function () {
  context.dataPlaneUrl = await ConnectionsPage.getDataPlaneUrl();
  updateEnvFile('DATA_PLANE_URL', context.dataPlaneUrl);
  context.dataPlaneUrl = process.env.DATA_PLANE_URL
  
});

Given('I capture the Write Key for the HTTP source named {string}', async function (sourceName) {
  await ConnectionsPage.openSource(sourceName);
  let withoutSeparatedValue = await ConnectionsPage.getWriteKey();
  context.writeKey = withoutSeparatedValue[1].trim()
  context.writeKey = process.env.WRITE_KEY
});

When('I send a track event via API', async function () {
 let { status, body } = await sendTrackEvent(context.dataPlaneUrl, context.writeKey, 'ci-test-event');
console.log("Normal Event - Status:", status);
console.log("Normal Event - Body:", body);

if (![200, 202].includes(status)) {
  throw new Error(`Normal Event failed with status ${status}`);
}

// ✅ 2. Simulated failure
// ({ status, body } = await sendTrackEvent(context.dataPlaneUrl,context.writeKey,'ci-test-event',{ simulateFailure: true }));
// console.log("Simulated Failure - Status:", status);
// console.log("Simulated Failure - Body:", body);

// if (status !== 400 && status !== 500) {
//   throw new Error(`Simulated Failure expected 400/500, got ${status}`);
// }

// ✅ 3. Invalid payload
({ status, body } = await sendTrackEvent(context.dataPlaneUrl,context.writeKey,'ci-test-event',{ invalidPayload: true }));
console.log("Invalid Payload - Status:", status);
console.log("Invalid Payload - Body:", body);
  if (status !== 400) {
  throw new Error(`Invalid Payload expected 400, got ${status}`);
  }

});

Then('I open the webhook destination named {string} and verify delivered count increased', async function (destName) {
  // read previous delivered count, then open, poll a few times until increased
await ConnectionsPage.openDestination(destName);
await ConnectionsPage.waitForPageLoad();

const maxRetries = 5; // 1 min total (30 x 2s)
const intervalMs = 30000;

// Get initial delivered count
let initial = await ConnectionsPage.getEventStats();
console.log(`Initial delivered count: ${initial.delivered}`);

for (let i = 0; i < maxRetries; i++) {
  // Optional: Refresh page or re-open destination to get latest stats
  await ConnectionsPage.refreshButtonEventsTab.click()

  await ConnectionsPage.waitForPageLoad();

  const stats = await ConnectionsPage.getEventStats();
  console.log(`Retry ${i + 1}: delivered=${stats.delivered}`);

  if (stats.delivered > initial.delivered) {
    console.log(`✅ Delivered increased from ${initial.delivered} to ${stats.delivered}`);
    return;
  }
  await browser.pause(intervalMs);
}
throw new Error(
  ` Delivered count did not increase within ${maxRetries * (intervalMs / 30000)} seconds`
);
});
