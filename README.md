# Playwright BDD Framework

A beginner-friendly browser automation framework that uses Cucumber for BDD scenarios and Playwright as the browser automation library. Playwright Test is not used as the test runner.

## A. Project architecture

```text
playwright-bdd-framework/
├── features/login.feature            # Gherkin behavior and scenario tags
├── step-definitions/login.steps.ts   # Cucumber steps calling page methods
├── pages/LoginPage.ts                # Locators and login-page interactions
├── hooks/hooks.ts                    # Browser setup, cleanup, and failure screenshots
├── config/config.ts                  # Environment loading and validated settings
├── config/.env.qa                     # QA settings
├── config/.env.uat                    # UAT settings
├── test-runner/runner.ts              # Cucumber invocation and HTML report generation
├── utils/                             # Reusable helpers can be added here
├── reports/                           # Cucumber JSON and HTML output
├── screenshots/                       # Screenshots from failed scenarios
├── playwright.config.ts               # Shared Playwright browser settings
├── cucumber.js                        # Cucumber feature/support-file configuration
├── tsconfig.json                      # TypeScript compiler settings
├── package.json                       # Dependencies and npm scripts
└── README.md                          # Setup and usage documentation
```

### Responsibilities

- **Feature file:** Describes behavior in Gherkin, a readable syntax using `Given`, `When`, `Then`, and `And`.
- **Step definitions:** Bind each Gherkin step to TypeScript code and call the page object.
- **Page Object Model:** Keeps selectors and UI interaction logic in `LoginPage`, rather than duplicating it in steps.
- **Hooks:** A Cucumber `Before` hook creates a browser, browser context, and page for each scenario. An `After` hook captures failure evidence and closes all resources.
- **Cucumber runner:** Cucumber executes tagged scenarios and steps. The TypeScript runner additionally creates an HTML report after execution.
- **Playwright `Page`:** Represents a browser tab and performs navigation, input, clicks, and assertions.
- **Browser:** The selected browser engine (Chromium by default).
- **BrowserContext:** An isolated session for each scenario, including its own cookies and storage.
- **Reporting:** Cucumber writes JSON results; `cucumber-html-reporter` turns them into a readable HTML report. Failed screenshots are attached to the Cucumber result and saved as PNG files.

## B. Installation

```bash
npm install
```

## C. Install Playwright browsers

```bash
npx playwright install
```

To install only Chromium:

```bash
npx playwright install chromium
```

## D. Configure environment files

Choose the environment with `TEST_ENV=qa` or `TEST_ENV=uat`. The selected environment file supplies `BASE_URL`, `USERNAME`, and `PASSWORD` (and takes precedence over same-named operating-system variables, including Windows' built-in `USERNAME`). The provided `.env.qa` and `.env.uat` files are configured for the SauceDemo test account. Change their values for a different test environment.

Available optional settings:

| Variable | Default | Description |
| --- | --- | --- |
| `TEST_ENV` | `qa` | Selects `.env.qa` or `.env.uat` |
| `BROWSER` | `chromium` | `chromium`, `firefox`, or `webkit` |
| `HEADLESS` | `true` | Run headless or headed |
| `TIMEOUT_MS` | `30000` | Playwright action/navigation timeout |
| `INVALID_USERNAME` | `invalid_user` | Username used by the negative scenario |
| `INVALID_PASSWORD` | `invalid_password` | Password used by the invalid-credentials scenario |
| `LOCKED_OUT_USERNAME` | Set in the environment file | SauceDemo locked-out account used by its regression scenario |

PowerShell environment selection:

```powershell
$env:TEST_ENV = "qa"
npm run test:bdd:html
```

## E. Execute all BDD tests

```bash
npm run test:bdd
```

To run the tests and generate the HTML report:

```bash
npm run test:bdd:html
```

## F. Execute a specific feature

Pass the feature path to Cucumber:

```bash
npx cucumber-js features/login.feature
```

## G. Execute a specific scenario or tag

Run scenarios by tag:

```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@regression"
npx cucumber-js --name "Verify error message for locked out user"
```

Or run a scenario by its name:

```bash
npx cucumber-js --name "Successful login with valid credentials"
```

`npx playwright test --grep "..."` is not used in this project: it starts Playwright Test, while these scenarios are executed by Cucumber. Use Cucumber's `--name` or `--tags` filters instead.

The same feature path and Cucumber options can be passed through the HTML-reporting runner, for example:

```bash
npx tsx test-runner/runner.ts --tags "@smoke"
```

## H. Run in headed mode

```bash
npm run test:bdd:headed
```

For direct Cucumber CLI use:

```powershell
$env:HEADLESS = "false"
npm run test:bdd
```

## I. Generate the HTML report

```bash
npm run test:bdd:html
```

The runner writes `reports/cucumber-report.json` and `reports/cucumber-report.html`. The HTML report includes features, scenarios, steps, status, duration, and failure details.

## J. Failure screenshots

When a scenario fails, the Cucumber `After` hook captures a full-page PNG under `screenshots/` and attaches the image to that scenario's Cucumber result. The report runner uses the JSON output to include available screenshot attachments in the generated report. Browser resources are closed even when screenshot capture or cleanup encounters an error.

## K. End-to-end execution flow

```text
Feature File
     ↓
Cucumber
     ↓
Step Definition
     ↓
Page Object
     ↓
Playwright
     ↓
Browser
     ↓
Application
     ↓
Cucumber Report
```

Cucumber reads each feature and matches its Gherkin steps to TypeScript step definitions. The step definitions call `LoginPage`, which uses Playwright's `Page` to interact with SauceDemo in the browser. Hooks isolate each scenario and capture diagnostics on failure. Cucumber records the results, and the HTML-reporting runner converts them to a readable report.

## Type-check the project

```bash
npm run typecheck
```
