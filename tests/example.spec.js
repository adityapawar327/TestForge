const { test, expect } = require('@playwright/test');
const config = require('../config/test.config');

/**
 * TestForge Example Test Suite
 * 
 * This suite demonstrates how to write tests using the TestForge framework.
 * It includes examples of common testing patterns and best practices.
 */
test.describe('TestForge Example Tests', { tag: '@smoke' }, () => {
  // This test demonstrates basic page navigation and interaction
  test('should successfully load the TestForge login page', async ({ page }) => {
    // Step 1: Navigate to the login page
    await test.step('Navigate to login page', async () => {
      await page.goto(config.getUrl('/login'));
      
      // Verify the page loaded successfully
      await expect(page).toHaveTitle(/Login | TestForge/);
      await expect(page.getByRole('heading', { name: 'Welcome to TestForge' })).toBeVisible();
    });

    // Step 2: Verify login form elements
    await test.step('Verify login form elements', async () => {
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    });
  });

  // This test demonstrates authentication and dashboard interaction
  test('should allow users to log in and view the dashboard', async ({ page }) => {
    // Get test user credentials
    const user = config.getUser('standard');

    // Step 1: Perform login
    await test.step('Authenticate with valid credentials', async () => {
      await page.goto(config.getUrl('/login'));
      
      // Fill in login form
      await page.getByLabel('Email').fill(user.email);
      await page.getByLabel('Password').fill(user.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Verify successful login redirect
      await expect(page).toHaveURL(config.getUrl('/dashboard'));
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    // Step 2: Verify dashboard elements
    await test.step('Verify dashboard elements', async () => {
      // Check for common dashboard elements
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Test Suites' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Test Results' })).toBeVisible();
      
      // Verify welcome message contains username
      const welcomeMessage = page.getByText(`Welcome, ${user.email}`).first();
      await expect(welcomeMessage).toBeVisible();
    });
  });

  // This test demonstrates API interaction and UI verification
  test('should display test execution results', async ({ page, request }) => {
    // First, log in via API to get authentication token
    const user = config.getUser('admin');
    const apiUrl = config.getApiUrl('/auth/login');
    
    // Step 1: Authenticate via API
    await test.step('Authenticate via API', async () => {
      const response = await request.post(apiUrl, {
        data: {
          email: user.email,
          password: user.password
        }
      });
      
      // Verify successful authentication
      expect(response.status()).toBe(200);
      const { token } = await response.json();
      expect(token).toBeTruthy();
      
      // Set authentication token for subsequent requests
      await page.addInitScript(`
        localStorage.setItem('authToken', '${token}');
      `);
    });

    // Step 2: Navigate to test results page
    await test.step('View test results', async () => {
      await page.goto(config.getUrl('/test-results'));
      
      // Verify page loads with test results
      await expect(page.getByRole('heading', { name: 'Test Results' })).toBeVisible();
      
      // Wait for test results to load
      const resultsTable = page.getByRole('table');
      await expect(resultsTable).toBeVisible();
      
      // Verify at least one test result is displayed
      const testRows = page.getByRole('row').filter({ has: page.getByRole('cell') });
      await expect(testRows).toHaveCountGreaterThan(0);
    });
  });
});
