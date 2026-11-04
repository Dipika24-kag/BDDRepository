// Hooks provide per-scenario browser setup/cleanup and failure diagnostics.
import {
  After,
  Before,
  Status,
  World,
  setDefaultTimeout,
  setWorldConstructor,
} from "@cucumber/cucumber";
import { chromium, firefox, webkit, type Browser, type BrowserContext, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { frameworkConfig } from "../config/config";
import { LoginPage } from "../pages/LoginPage";

export class LoginWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  loginPage?: LoginPage;
}

setWorldConstructor(LoginWorld);
setDefaultTimeout(frameworkConfig.timeoutMs);

Before(async function (this: LoginWorld) {
  const browserTypes = { chromium, firefox, webkit };
  this.browser = await browserTypes[frameworkConfig.browserName].launch({
    headless: frameworkConfig.headless,
  });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(frameworkConfig.timeoutMs);
  this.loginPage = new LoginPage(this.page);
});

After(async function (this: LoginWorld, { pickle, result }) {
  try {
    if (result?.status === Status.FAILED && this.page) {
      const screenshotDirectory = join(process.cwd(), "screenshots");
      await mkdir(screenshotDirectory, { recursive: true });

      const safeScenarioName = pickle.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const screenshotPath = join(
        screenshotDirectory,
        `${safeScenarioName}-${timestamp}.png`,
      );
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      await this.attach(screenshot, "image/png");
      console.error(`Failure screenshot saved to ${screenshotPath}`);
    }
  } finally {
    try {
      await this.page?.close();
    } finally {
      try {
        await this.context?.close();
      } finally {
        await this.browser?.close();
      }
    }
  }
});
