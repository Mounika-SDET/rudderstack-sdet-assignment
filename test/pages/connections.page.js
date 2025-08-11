class ConnectionsPage {

 
  get closeButton(){ return $(`//button[@aria-label="Close"]`)}
  get loadingSpinners(){ return $(`//div[contains(@class, "loader_spinnerContainer") and .//span[contains(text(), "Synchromeshing gears")]]`)}
  get ConnectionsPageHeader(){ return $(`//h3[contains(text(),'Connections')]`)}
  get dataPlaneEl() { return $(`//span[contains(text(), "rudderstack.com")]`); }
  get sourcesList() { return $('div.sources-list'); }
  get writeKeyText() { return $(`//span[contains(normalize-space(),'Write key')]`); }
  //get writeKeyValue(){ return $(`//span/following-sibling::button`)}
 
  get eventsTab(){ return $(`//div[@role='tab' and normalize-space(text())='Events']`)}
  get destinationsTab() { return $(`//span[normalize-space(text())='Enabled']`); }
 get deliveredCount() {return $('//span[normalize-space(.)="Delivered"]/following-sibling::div//span');}
  get failedCounter() { return $('//*[contains(text(),"Failed")]/following::span[1]'); }
 get refreshButtonEventsTab(){ return $(`//button[(@type='button') and (normalize-space(.)="Refresh")]`)}
  async moveToConnectionsPage() {
    await this.closeButton.isExisting();
    await this.closeButton.click()
    //await this.spinner.waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: 'Spinner did not disappear in time' });
    await this.ConnectionsPageHeader.waitForDisplayed({ timeout : 10000})
    console.log('Connections page' + await this.ConnectionsPageHeader.isDisplayed())
    expect(await this.ConnectionsPageHeader.isDisplayed()).toBe(true)
    await browser.pause(5000)
  }

  async getDataPlaneUrl() {
    await this.dataPlaneEl.waitForDisplayed({ timeout: 8000 });
    console.log("DataPlaneURL"+ await this.dataPlaneEl.getText());
    return (await this.dataPlaneEl.getText()).trim();

  }

  async openSource(sourceName) {
    const HttpSource = await $(`//span[text()="${sourceName}"]`).getText();
    console.log("Http source text"+HttpSource)
  }

  async getWriteKey() {
    await this.writeKeyText.waitForDisplayed({ timeout: 8000 });
    console.log("Write key text" + (await this.writeKeyText.getText()).trim())
    return (await this.writeKeyText.getText()).split('key');
  }

  async openDestination(destName) {
    await this.destinationsTab.click();
    await $(`//div[text()="${destName}"]`).click();
    await this.eventsTab.click();
    await browser.waitUntil(
            async () => (await browser.getUrl()).includes('tab=Events'),
            {
                timeout: 10000,
                timeoutMsg: 'URL did not change to Events tab within 10s'
            }
        );
  }

  async getEventStats() {
    const deliveredText = await this.deliveredCount.getText();
    const failedText = await this.failedCounter.getText();
    return { delivered: parseInt(deliveredText || '0', 10), failed: parseInt(failedText || '0', 10) };
  }
async waitForPageLoad() {
  // Wait for page ready state
  await browser.waitUntil(async () => {
      const state = await browser.execute(() => document.readyState);
      return state === 'complete';
       },
      {
      timeout: 10000,
      timeoutMsg: 'Page did not fully load in time',
     }
    );

  await this.deliveredCount.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: '"Delivered" label not visible after page load',
  });

  // Wait for the Delivered number to be non-empty
  await browser.waitUntil(
    async () => {
      const text = await this.deliveredCount.getText();
      console.log("Delivered count"+text)
      return text.trim().length > 0 && !isNaN(parseInt(text, 10));
    },
    {
      timeout: 10000,
      timeoutMsg: 'Delivered count not available after page load',
    }
  );
}

  
}

module.exports = new ConnectionsPage();