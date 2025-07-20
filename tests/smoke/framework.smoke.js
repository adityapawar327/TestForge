const { test, expect } = require('@playwright/test');
const config = require('../../config/test.config');
const testDataFactory = require('../../utils/testDataFactory');

// Simple smoke test to verify the framework is working
test.describe('Framework Smoke Tests', () => {
  test('should load test configuration', () => {
    console.log('Test Configuration:', {
      baseUrl: config.baseUrl,
      environment: config.environment,
      headless: config.headless,
    });
    
    expect(config.baseUrl).toBeTruthy();
    expect(config.environment).toBeTruthy();
  });
  
  test('should generate test data', () => {
    const user = testDataFactory.createUser({ role: 'tester' });
    console.log('Generated test user:', user);
    
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user.role).toBe('tester');
  });
  
  test('should navigate to example.com', async ({ page }) => {
    await page.goto('https://example.com');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    expect(title).toContain('Example Domain');
    await page.screenshot({ path: 'test-results/smoke-test-screenshot.png' });
  });
});
