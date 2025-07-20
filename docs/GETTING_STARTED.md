# Getting Started with Playwright MCP Test Framework

Welcome to the Playwright MCP Test Framework! This guide will help you set up and start using the framework for your test automation needs.

## Prerequisites

- Node.js 16 or higher
- npm 8 or higher
- Git (for version control)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright-mcp-framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

## Configuration

1. **Environment Variables**
   Create a `.env` file in the project root with the following variables:
   ```
   # MCP Configuration
   MCP_CLIENT_ID=your-client-id
   MCP_CLIENT_SECRET=your-client-secret
   MCP_TEST_DATA_ENDPOINT=https://api.mcp.example.com/test-data
   
   # Test Configuration
   HEADLESS=true  # Set to false to run browsers in headed mode
   SLOW_MO=0     # Slow down test execution by specified milliseconds
   ```

2. **Playwright Configuration**
   The framework comes with a pre-configured `playwright.config.js` file. You can modify it to suit your needs:
   - Update `testDir` to point to your test directory
   - Configure browsers and devices under the `projects` section
   - Adjust timeouts and retries as needed

## Running Tests

### Basic Commands

- **Run all tests**
  ```bash
  npx playwright test
  ```

- **Run tests in UI mode**
  ```bash
  npx playwright test --ui
  ```

- **Run tests in debug mode**
  ```bash
  npx playwright test --debug
  ```

- **Run specific test file**
  ```bash
  npx playwright test tests/examples/mcpIntegration.spec.js
  ```

- **Run tests in a specific browser**
  ```bash
  npx playwright test --project=chromium
  ```

### Test Reports

After running tests, you can find various reports in the `test-results` directory:
- HTML reports
- Screenshots
- Videos (for failed tests)
- Traces (for debugging)

## Writing Tests

### Basic Test Structure

```javascript
const { test, expect } = require('../../fixtures/test.fixture');

test.describe('Example Test Suite', () => {
  test('should demonstrate basic test structure', async ({ page, testData }) => {
    // Test implementation
  });
});
```

### Using Test Data

```javascript
test('should use test data', async ({ testData }) => {
  // Get test data from MCP
  const config = await testData.getTestData('test-config');
  
  // Generate test data on the fly
  const user = testDataFactory.createUser({ role: 'admin' });
  
  // Seed test data
  const seededUser = await testDataSeeder.seed('users', user);
});
```

### Browser Automation

```javascript
test('should demonstrate browser automation', async ({ page, browserManager }) => {
  // Navigate to a page
  await page.goto('https://example.com');
  
  // Interact with elements
  await page.fill('#username', 'testuser');
  await page.click('button[type="submit"]');
  
  // Assertions
  await expect(page).toHaveTitle(/Example Domain/);
  
  // Take a screenshot
  await page.screenshot({ path: 'example-screenshot.png' });
});
```

## Advanced Features

### Test Orchestration

```javascript
const testOrchestrator = require('../orchestration/testOrchestrator');

// Define test steps
const testSteps = [
  async (state) => {
    // Step 1: Setup
    return { testData: { /* ... */ } };
  },
  async (state, { page }) => {
    // Step 2: Perform actions
    await page.goto('https://example.com');
    return { navigationComplete: true };
  },
  // More steps...
];

// Create and run the scenario
const scenario = testOrchestrator.createTestScenario(testSteps);
const result = await scenario(initialState);
```

### Parallel Test Execution

```javascript
test('should run tests in parallel', async ({ browserManager }) => {
  const browsers = ['chromium', 'firefox'];
  const results = await Promise.all(
    browsers.map(async (browserType) => {
      const browser = await browserManager.launchBrowser(browserType);
      // Test implementation...
    })
  );
});
```

## Best Practices

1. **Page Object Model**
   - Create page objects for better maintainability
   - Keep selectors in a separate file

2. **Test Data Management**
   - Use the test data factory for generating test data
   - Clean up test data after tests

3. **Error Handling**
   - Implement proper error handling
   - Add meaningful error messages

4. **Logging**
   - Use console.log for debugging
   - Consider adding a proper logging utility

## Troubleshooting

- **Tests are failing**
  - Check the test-results directory for screenshots and traces
  - Run tests with `--debug` flag for more detailed output
  - Verify that all required environment variables are set

- **Browser issues**
  - Make sure all required browsers are installed
  - Run `npx playwright install` to install missing browsers

## Next Steps

- Explore the example tests in the `tests/examples` directory
- Customize the framework to fit your project's needs
- Integrate with your CI/CD pipeline

## Support

For issues and feature requests, please [open an issue](https://github.com/your-org/playwright-mcp-framework/issues) on GitHub.
