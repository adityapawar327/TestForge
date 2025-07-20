const { test: baseTest, expect } = require('@playwright/test');
const browserManager = require('../utils/browserManager');
const testDataManager = require('../utils/testDataManager');

// Extend the base test with our custom fixtures
const test = baseTest.extend({
  // Browser context with MCP integration
  context: async ({ browser }, use) => {
    // Create a new context with default options
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: 'test-results/videos/' },
    });
    
    // Add MCP test data to the context
    context.testData = async (key, options) => {
      return testDataManager.getTestData(key, options);
    };
    
    // Use the context in the test
    await use(context);
    
    // Clean up after the test
    await context.close();
  },
  
  // Page with extended capabilities
  page: async ({ context }, use) => {
    const page = await context.newPage();
    
    // Add utility methods to the page object
    page.safeClick = async (selector, options = {}) => {
      await page.waitForSelector(selector, { state: 'visible', ...options });
      await page.click(selector, options);
    };
    
    page.safeType = async (selector, text, options = {}) => {
      await page.waitForSelector(selector, { state: 'visible', ...options });
      await page.fill(selector, text, options);
    };
    
    // Add test data accessor
    page.getTestData = async (key, options) => {
      return testDataManager.getTestData(key, options);
    };
    
    // Use the enhanced page in the test
    await use(page);
  },
  
  // Test data access
  testData: [
    async ({}, use) => {
      // Use the test data manager directly in tests
      await use(testDataManager);
    },
    { auto: true },
  ],
  
  // Browser manager access
  browserManager: [
    async ({}, use) => {
      // Initialize browser manager if needed
      if (browserManager.browserConfigs.size === 0) {
        await browserManager.initialize();
      }
      await use(browserManager);
    },
    { scope: 'worker' }, // Share browser manager across all tests in the worker
  ],
});

// Export the enhanced test and expect objects
module.exports = { test, expect };

// Re-export commonly used utilities
module.exports.utils = {
  testDataManager,
  browserManager,
};
