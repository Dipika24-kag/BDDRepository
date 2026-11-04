// The runner delegates BDD execution to Cucumber, then builds an HTML report from its JSON output.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

interface HtmlReporterOptions {
  jsonFile: string;
  output: string;
  reportName: string;
  reportSuiteAsScenarios: boolean;
  launchReport: boolean;
  storeScreenshots: boolean;
  screenshotsDirectory: string;
  theme: "bootstrap";
}

interface HtmlReporter {
  generate(options: HtmlReporterOptions): void;
}

const reportDirectory = resolve(process.cwd(), "reports");
mkdirSync(reportDirectory, { recursive: true });
mkdirSync(resolve(process.cwd(), "screenshots"), { recursive: true });

const cucumberCli = resolve(
  process.cwd(),
  "node_modules",
  "@cucumber",
  "cucumber",
  "bin",
  "cucumber.js",
);
if (!existsSync(cucumberCli)) {
  throw new Error(`Cucumber CLI was not found at ${cucumberCli}. Run npm install first.`);
}

const incomingArguments = process.argv.slice(2);
const headed = incomingArguments.includes("--headed");
const cucumberArguments = incomingArguments.filter((argument) => argument !== "--headed");
const environment = { ...process.env };
if (headed) {
  environment.HEADLESS = "false";
}

const cucumberResult = spawnSync(process.execPath, [cucumberCli, ...cucumberArguments], {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
});

if (cucumberResult.error) {
  throw cucumberResult.error;
}

const jsonReportPath = resolve(reportDirectory, "cucumber-report.json");
if (!existsSync(jsonReportPath)) {
  throw new Error(
    `Cucumber did not produce ${jsonReportPath}; check the Cucumber output above for configuration errors.`,
  );
}

const reporter = require("cucumber-html-reporter") as HtmlReporter;
reporter.generate({
  jsonFile: jsonReportPath,
  output: resolve(reportDirectory, "cucumber-report.html"),
  reportName: "Playwright BDD Test Report",
  reportSuiteAsScenarios: true,
  launchReport: false,
  storeScreenshots: true,
  screenshotsDirectory: resolve(process.cwd(), "screenshots"),
  theme: "bootstrap",
});
console.log(`HTML report generated: ${resolve(reportDirectory, "cucumber-report.html")}`);

process.exitCode = cucumberResult.status ?? 1;
