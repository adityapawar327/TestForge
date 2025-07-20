const { test, expect } = require('@playwright/test');

test.describe('Example Test Suite', () => {
  test('should navigate to example.com', async ({ page }) => {
    await test.step('Navigate to example.com', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Verify page title', async () => {
      const title = await page.title();
      expect(title).toContain('Example Domain');
    });
  });
});
