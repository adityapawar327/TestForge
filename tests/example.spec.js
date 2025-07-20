const { test, expect } = require('@playwright/test');

/**
 * Playwright Demo Website Test Suite
 * 
 * This suite demonstrates testing the official Playwright demo website.
 */
test.describe('Playwright Demo Tests', { tag: '@smoke' }, () => {
  // This test verifies the main page loads correctly and has key elements
  test('should load Playwright homepage and verify key elements', async ({ page }) => {
    // Step 1: Navigate to Playwright website
    await test.step('Navigate to Playwright homepage', async () => {
      await page.goto('https://playwright.dev/');
      
      // Verify the page loaded successfully
      await expect(page).toHaveTitle(/Playwright/);
      await expect(page).toHaveURL(/playwright\.dev/);
    });

    // Step 2: Verify main navigation elements
    await test.step('Verify main navigation elements', async () => {
      // Check for important navigation links
      const navLinks = [
        'Docs',
        'API',
        'Community',
        'Blog',
        'GitHub'
      ];

      for (const linkText of navLinks) {
        await test.step(`Verify ${linkText} link is visible`, async () => {
          const link = page.getByRole('link', { name: new RegExp(linkText, 'i') });
          await expect(link).toBeVisible();
        });
      }
    });

    // Step 3: Verify main content sections
    await test.step('Verify main content sections', async () => {
      // Check for main heading
      await expect(page.getByRole('heading', { 
        name: /Fast and reliable end-to-end testing for modern web apps/ 
      })).toBeVisible();
      
      // Check for installation command
      const installCommand = page.locator('code', { hasText: 'npm init playwright@latest' });
      await expect(installCommand).toBeVisible();
      
      // Check for getting started button
      const getStartedButton = page.getByRole('link', { name: /Get started/i }).first();
      await expect(getStartedButton).toBeVisible();
    });
  });

  // This test verifies the documentation navigation
  test('should navigate to documentation', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    
    await test.step('Navigate to documentation', async () => {
      // Click on Docs link
      const docsLink = page.getByRole('link', { name: /docs/i });
      await docsLink.click();
      
      // Verify documentation page loaded
      await expect(page).toHaveURL(/playwright\.dev\/docs/);
      await expect(page.getByRole('heading', { 
        name: /Installation/ 
      })).toBeVisible();
      
      // Check for important documentation sections
      const docSections = [
        'Getting Started',
        'Core Concepts',
        'Guides',
        'API Reference'
      ];

      for (const section of docSections) {
        const sectionLink = page.getByRole('link', { name: section });
        await expect(sectionLink).toBeVisible();
      }
    });
  });
});
