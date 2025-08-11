class LoginPage {
  get emailInput() { return $('#text-input-email'); }
  get passwordInput() { return $('#text-input-password'); }
  get loginButton() { return $('//button[span[normalize-space()="Log in"]]'); }
  get doitLater(){ return $(`//a[@href="/addmfalater" and normalize-space(text())="I'll do this later"]`)}
  get goToDashBoard(){ return $(`//button[span[normalize-space()="Go to dashboard"]]`)}

  async open() {
    await browser.url('/');
  }

  async login(email, password) {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
    await browser.pause(8000)
    if(await this.doitLater.isDisplayed() === true){
     await this.doitLater.click()
     await this.goToDashBoard.isClickable()
     await this.goToDashBoard.click()
    }
    
  }
}

module.exports = new LoginPage();