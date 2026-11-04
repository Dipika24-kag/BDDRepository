import type { Page } from "playwright";
import { frameworkConfig } from "../config/config";

// The Page Object Model keeps selectors and browser interactions out of step definitions.
export class LoginPage {
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly inventoryContainer = '[data-test="inventory-container"]';
  private readonly errorMessage = '[data-test="error"]';

  constructor(private readonly page: Page) {}

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(frameworkConfig.baseUrl);
  }

  async enterUsername(username: string): Promise<void> {
    await this.page.locator(this.usernameInput).fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.page.locator(this.passwordInput).fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.page.locator(this.loginButton).click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.locator(this.inventoryContainer).waitFor({
      state: "visible",
      timeout: frameworkConfig.timeoutMs,
    });

    const currentUrl = this.page.url();
    if (!currentUrl.includes("/inventory.html")) {
      throw new Error(`Expected the inventory page after login, but landed on: ${currentUrl}`);
    }
  }

  async verifyInvalidCredentialsError(): Promise<void> {
    await this.verifyErrorMessage(
      "Username and password do not match any user in this service",
      "invalid-credentials",
    );
  }

  async verifyLockedOutUserError(): Promise<void> {
    await this.verifyErrorMessage("Sorry, this user has been locked out.", "locked-out-user");
  }

  private async verifyErrorMessage(expectedMessage: string, errorDescription: string): Promise<void> {
    const error = this.page.locator(this.errorMessage);
    await error.waitFor({ state: "visible", timeout: frameworkConfig.timeoutMs });

    const actualMessage = await error.innerText();
    if (!actualMessage.includes(expectedMessage)) {
      throw new Error(
        `Expected a ${errorDescription} message containing "${expectedMessage}", received: "${actualMessage}"`,
      );
    }
  }
}
