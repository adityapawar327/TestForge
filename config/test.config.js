require('dotenv').config({ path: '.env' });

/**
 * Test configuration settings
 * Loads environment variables with defaults
 */
module.exports = {
  // Application settings
  baseUrl: process.env.BASE_URL || 'https://example.com',
  environment: process.env.ENVIRONMENT || 'staging',
  
  // Test execution settings
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  timeout: 30000, // Default timeout in milliseconds
  expect: {
    timeout: 10000, // Default expect timeout
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  
  // Browser settings
  browser: process.env.BROWSER || 'chromium',
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || '1920', 10),
    height: parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10),
  },
  
  // Test data settings
  testUsers: {
    standard: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Test@123',
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123',
    },
  },
  
  // Reporting settings
  reporter: [
    ['list'],
    ['html', { 
      open: 'never',
      outputFolder: process.env.REPORT_PATH || 'test-results/html-reports',
    }],
    ['junit', { 
      outputFile: `${process.env.REPORT_PATH || 'test-results'}/junit/results.xml`,
    }],
  ],
  
  // Screenshot and video settings
  screenshot: process.env.SCREENSHOT_ON_FAILURE !== 'false' ? 'only-on-failure' : 'off',
  video: process.env.VIDEO_ON_FAILURE !== 'false' ? 'on-first-retry' : 'off',
  trace: process.env.TRACE_ON_RETRY !== 'false' ? 'on-first-retry' : 'off',
  
  // CI/CD settings
  ci: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',
  workers: process.env.CI ? 2 : undefined, // Use 2 workers in CI, use default locally
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  
  // Debug settings
  debug: process.env.DEBUG === 'true',
  
  // Environment-specific settings
  get isProduction() {
    return this.environment === 'production';
  },
  get isStaging() {
    return this.environment === 'staging';
  },
  get isDevelopment() {
    return this.environment === 'development';
  },
  
  // Helper methods
  getUrl(path = '') {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  },
  
  getApiUrl(path = '') {
    const apiBase = this.baseUrl.includes('localhost') 
      ? 'http://localhost:3000/api'
      : `${this.baseUrl}/api`;
    return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;
  },
  
  // Get test user credentials
  getUser(role = 'standard') {
    const user = this.testUsers[role.toLowerCase()];
    if (!user) {
      throw new Error(`No test user found for role: ${role}`);
    }
    return { ...user };
  },
};
