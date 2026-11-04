// Shared Playwright browser settings; scenarios are executed by Cucumber, not Playwright Test.
import { frameworkConfig } from "./config/config";

export const playwrightConfig = {
  baseURL: frameworkConfig.baseUrl,
  browserName: frameworkConfig.browserName,
  headless: frameworkConfig.headless,
  timeout: frameworkConfig.timeoutMs,
};
