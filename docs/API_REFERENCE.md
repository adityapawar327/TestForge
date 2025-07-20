# API Reference

This document provides detailed information about the key components and APIs available in the Playwright MCP Test Framework.

## Table of Contents

1. [Test Fixtures](#test-fixtures)
2. [MCP Client](#mcp-client)
3. [Test Data Management](#test-data-management)
4. [Browser Management](#browser-management)
5. [Test Orchestration](#test-orchestration)
6. [Utilities](#utilities)

## Test Fixtures

The framework provides custom test fixtures that extend Playwright's built-in fixtures.

### Usage

```javascript
const { test, expect } = require('../fixtures/test.fixture');

test('example test', async ({ page, testData, browserManager }) => {
  // Test implementation
});
```

### Available Fixtures

- **`page`**: Enhanced Page object with additional methods
  - `safeClick(selector, options)`: Waits for element to be visible before clicking
  - `safeType(selector, text, options)`: Waits for element to be visible before typing
  - `getTestData(key, options)`: Get test data from MCP

- **`testData`**: Test data manager instance
  - `getTestData(key, options)`: Get test data by key
  - `clearCache(key)`: Clear cached test data

- **`browserManager`**: Browser management utilities
  - `launchBrowser(browserType, options)`: Launch a browser instance
  - `createContext(options)`: Create a new browser context
  - `createPage()`: Create a new page
  - `getMobileDevice(deviceName)`: Get mobile device configuration

## MCP Client

The `mcpClient` handles communication with the MCP (Microsoft Cloud Platform) services.

### Initialization

```javascript
const mcpClient = require('../utils/mcpClient');
```

### Methods

- **`getTestData(key, options)`**: Get test data by key
  ```javascript
  const data = await mcpClient.getTestData('test-config');
  ```

- **`getConfig(configName, environment)`**: Get configuration by name
  ```javascript
  const config = await mcpClient.getConfig('browser-settings', 'staging');
  ```

- **`getEnvironmentConfig(environment)`**: Get environment configuration
  ```javascript
  const envConfig = await mcpClient.getEnvironmentConfig('staging');
  ```

## Test Data Management

### Test Data Factory

Generate test data dynamically.

```javascript
const testDataFactory = require('../utils/testDataFactory');

// Create test user
const user = testDataFactory.createUser({
  email: 'test@example.com',
  role: 'admin'
});

// Create test product
const product = testDataFactory.createProduct({
  name: 'Test Product',
  price: 99.99
});
```

### Test Data Seeder

Seed and clean up test data.

```javascript
const testDataSeeder = require('../utils/testDataSeeder');

// Seed test data
const user = await testDataSeeder.generateAndSeed('user', {
  email: 'test@example.com',
  role: 'tester'
});

// Clean up test data
afterAll(async () => {
  await testDataSeeder.cleanup();
});
```

## Browser Management

### Browser Manager

Manage browser instances and contexts.

```javascript
const browserManager = require('../utils/browserManager');

// Launch a browser
const browser = await browserManager.launchBrowser('chromium');

// Create a new context
const context = await browserManager.createContext({
  viewport: { width: 1280, height: 720 }
});

// Create a new page
const page = await browserManager.createPage();

// Get mobile device configuration
const mobileDevice = browserManager.getMobileDevice('iPhone 11');
```

## Test Orchestration

### Test Orchestrator

Manage complex test workflows.

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

## Utilities

### Test Helpers

```javascript
const { takeScreenshot, waitForNetworkIdle } = require('../utils/helpers');

// Take a screenshot
await takeScreenshot(page, 'screenshot-name');

// Wait for network to be idle
await waitForNetworkIdle(page);
```

### Configuration

```javascript
const config = require('../config');

// Access configuration
console.log('Base URL:', config.baseUrl);
console.log('Environment:', config.environment);
```

## Error Handling

The framework provides consistent error handling:

```javascript
try {
  // Code that might throw an error
} catch (error) {
  // Log the error
  console.error('Test failed:', error);
  
  // Take a screenshot on error
  await page.screenshot({ path: 'error-screenshot.png' });
  
  // Re-throw the error to fail the test
  throw error;
}
```

## Best Practices

1. **Use Page Object Model**
   - Create page objects for better maintainability
   - Keep selectors in a separate file

2. **Handle Test Data Properly**
   - Use the test data factory for generating test data
   - Clean up test data after tests

3. **Implement Proper Error Handling**
   - Use try/catch blocks for critical operations
   - Add meaningful error messages

4. **Use the Right Selectors**
   - Prefer data-testid attributes for selectors
   - Avoid using XPath unless necessary

5. **Write Atomic Tests**
   - Each test should be independent
   - Don't rely on test execution order

## Troubleshooting

### Common Issues

- **Tests are flaky**
  - Add proper waits and retries
  - Use `waitForSelector` before interacting with elements

- **Browser crashes**
  - Make sure you have enough system resources
  - Update browser drivers

- **Test data issues**
  - Verify test data in MCP
  - Check for data conflicts between tests

### Debugging

- Run tests with `--debug` flag
- Check the `test-results` directory for screenshots and traces
- Use `console.log()` for debugging

## Support

For additional help, please refer to the [Getting Started Guide](./GETTING_STARTED.md) or open an issue on GitHub.
