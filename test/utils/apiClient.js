const request = require('supertest');

async function sendTrackEvent(dataPlaneUrl,writeKey,eventName = 'ci-test',{ simulateFailure = false, invalidPayload = false } = {}) {
  if (!dataPlaneUrl || !writeKey) throw new Error('Missing dataPlaneUrl or writeKey');

  // Optionally change Data Plane URL to an invalid one to force failure
  let targetUrl = dataPlaneUrl;
  if (simulateFailure) {
    targetUrl = dataPlaneUrl.replace(/:\/\/[^/]+/, '://invalid-endpoint.local');
  }

  const endpoint = targetUrl.replace(/\/$/, '') + '/v1/track';
  const urlObj = new URL(endpoint);
  const base = `${urlObj.protocol}//${urlObj.host}`; // host includes port if present
  const path = urlObj.pathname + (urlObj.search || '');

  // Default payload
  let payload = {
    anonymousId: `anon-${Date.now()}`,
    event: `${eventName}-${Date.now()}`,
    properties: { automated: true }
  };

  // Optionally send invalid payload to trigger rejection
  if (invalidPayload) {
    payload = null; 
  }

  console.log('[sendTrackEvent] POST', base + path);
  console.log('[sendTrackEvent] payload:', JSON.stringify(payload));

  try {
    const res = await request(base)
      .post(path)
      .auth(writeKey, '') // basic auth
      .set('Content-Type', 'application/json')
      .send(payload)
      .timeout({ deadline: 15000 });

    console.log('[sendTrackEvent] status:', res.status, 'body:', res.body || res.text);
    return { status: res.status, body: res.body || res.text };
  } catch (err) {
    console.error('[sendTrackEvent] ERROR:', err.message);
    if (err.response) console.error('[sendTrackEvent] err.response.text:', err.response.text);
    throw err;
  }
}

module.exports = { sendTrackEvent };
