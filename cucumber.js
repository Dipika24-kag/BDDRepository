// Cucumber loads the TypeScript hooks and steps through ts-node for direct CLI runs too.
module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["hooks/**/*.ts", "step-definitions/**/*.ts"],
    format: ["progress", "json:reports/cucumber-report.json"],
  },
};
