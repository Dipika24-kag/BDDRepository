import { config as loadDotEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const supportedEnvironments = ["qa", "uat"] as const;
type TestEnvironment = (typeof supportedEnvironments)[number];
type BrowserName = "chromium" | "firefox" | "webkit";

const requestedEnvironment = (process.env.TEST_ENV ?? "qa").toLowerCase();
if (!supportedEnvironments.includes(requestedEnvironment as TestEnvironment)) {
  throw new Error(
    `Unsupported TEST_ENV "${requestedEnvironment}". Choose one of: ${supportedEnvironments.join(", ")}.`,
  );
}

const environmentFile = resolve(__dirname, `.env.${requestedEnvironment}`);
if (!existsSync(environmentFile)) {
  throw new Error(`Environment file not found: ${environmentFile}`);
}

// The selected file must win over the Windows USERNAME account variable.
const dotenvResult = loadDotEnv({ path: environmentFile, override: true });
if (dotenvResult.error) {
  throw dotenvResult.error;
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable "${name}" in ${environmentFile}.`);
  }
  return value;
}

function getBrowserName(): BrowserName {
  const value = (process.env.BROWSER ?? "chromium").toLowerCase();
  if (value === "chromium" || value === "firefox" || value === "webkit") {
    return value;
  }
  throw new Error(`Unsupported BROWSER "${value}". Choose chromium, firefox, or webkit.`);
}

function getBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.toLowerCase();
  if (value === undefined) {
    return defaultValue;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Environment variable "${name}" must be "true" or "false".`);
}

const baseUrl = requiredEnvironmentValue("BASE_URL");
try {
  new URL(baseUrl);
} catch {
  throw new Error(`BASE_URL must be an absolute URL. Received: "${baseUrl}".`);
}

const timeoutMs = Number(process.env.TIMEOUT_MS ?? 30000);
if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
  throw new Error(`TIMEOUT_MS must be a positive integer. Received: "${process.env.TIMEOUT_MS}".`);
}

export const frameworkConfig = {
  baseUrl,
  browserName: getBrowserName(),
  headless: getBoolean("HEADLESS", true),
  timeoutMs,
  username: requiredEnvironmentValue("USERNAME"),
  password: requiredEnvironmentValue("PASSWORD"),
  lockedOutUsername: requiredEnvironmentValue("LOCKED_OUT_USERNAME"),
  invalidUsername: process.env.INVALID_USERNAME?.trim() || "invalid_user",
  invalidPassword: process.env.INVALID_PASSWORD?.trim() || "invalid_password",
};
