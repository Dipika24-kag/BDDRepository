// Step definitions connect readable Gherkin steps to reusable page-object behavior.
import { Given, When, Then } from "@cucumber/cucumber";
import type { LoginWorld } from "../hooks/hooks";
import { frameworkConfig } from "../config/config";

function getLoginPage(world: LoginWorld) {
  if (!world.loginPage) {
    throw new Error("LoginPage is unavailable; the Cucumber Before hook may not have run.");
  }
  return world.loginPage;
}

Given("I navigate to the login page", async function (this: LoginWorld) {
  await getLoginPage(this).navigateToLoginPage();
});

When("I enter valid username and password", async function (this: LoginWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.enterUsername(frameworkConfig.username);
  await loginPage.enterPassword(frameworkConfig.password);
});

When("I enter invalid username and password", async function (this: LoginWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.enterUsername(frameworkConfig.invalidUsername);
  await loginPage.enterPassword(frameworkConfig.invalidPassword);
});

When("I enter credentials for a locked out user", async function (this: LoginWorld) {
  const loginPage = getLoginPage(this);
  await loginPage.enterUsername(frameworkConfig.lockedOutUsername);
  await loginPage.enterPassword(frameworkConfig.password);
});

When("I click the login button", async function (this: LoginWorld) {
  await getLoginPage(this).clickLogin();
});

Then("I should be successfully logged in", async function (this: LoginWorld) {
  await getLoginPage(this).verifySuccessfulLogin();
});

Then("I should see an error message for invalid credentials", async function (this: LoginWorld) {
  await getLoginPage(this).verifyInvalidCredentialsError();
});

Then("I should see an error message for a locked out user", async function (this: LoginWorld) {
  await getLoginPage(this).verifyLockedOutUserError();
});
