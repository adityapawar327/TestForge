require('dotenv').config({ path: '.env' });
const path = require('path');

/**
 * TestForge - Test Configuration
 * 
 * Centralized configuration for TestForge test execution.
 * All test settings, environment variables, and runtime configurations are managed here.
 */

module.exports = {
  // ====== Application Settings ======
  app: {
    // Base URL for the application under test
    baseUrl: process.env.TEST_BASE_URL || 'https://app.testforge.contoso.com',
    
    // Environment (development, staging, production)
    environment: process.env.NODE_ENV || 'development',
    
    // API base URL (if different from the main app URL)
    apiUrl: process.env.API_BASE_URL || 'https://api.testforge.contoso.com/v1',
    
    // Authentication settings
    auth: {
      // Enable/disable authentication for tests
      enabled: process.env.AUTH_ENABLED !== 'false',
      
      // Default login credentials (should be overridden in .env for security)
      credentials: {
        standard: {
          email: process.env.TEST_USER_EMAIL || 'test@testforge.contoso.com',
          password: process.env.TEST_USER_PASSWORD || 'SecurePass123!',
          role: 'standard',
        },
        admin: {
          email: process.env.TEST_ADMIN_EMAIL || 'admin@testforge.contoso.com',
          password: process.env.TEST_ADMIN_PASSWORD || 'AdminSecurePass123!',
          role: 'admin',
        },
      },
    },
  },

  // ====== Test Execution Settings ======
  execution: {
    // Run tests in headless mode (true for CI, false for local development)
    headless: process.env.HEADLESS !== 'false',
    
    // Slow down test execution by the specified number of milliseconds
    slowMo: parseInt(process.env.TEST_SLOW_MO || '0', 10),
    
    // Default test timeout in milliseconds
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
    
    // Expect timeout for assertions
    expect: {
      timeout: parseInt(process.env.EXPECT_TIMEOUT || '10000', 10),
      toHaveScreenshot: { 
        maxDiffPixelRatio: parseFloat(process.env.SCREENSHOT_DIFF_THRESHOLD || '0.01'),
      },
    },
    
    // Test retry settings
    retries: {
      // Number of retries for failed tests (in CI)
      ci: parseInt(process.env.CI_RETRIES || '2', 10),
      
      // Number of retries for local development
      local: parseInt(process.env.LOCAL_RETRIES || '0', 10),
    },
    
    // Number of test workers (parallel test execution)
    workers: process.env.CI 
      ? parseInt(process.env.CI_WORKERS || '2', 10) 
      : require('os').cpus().length - 1 || 1,
  },

  // ====== Browser Configuration ======
  browser: {
    // Default browser (chromium, firefox, webkit)
    default: process.env.DEFAULT_BROWSER || 'chromium',
    
    // Viewport settings
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920', 10),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10),
      deviceScaleFactor: 1,
      isMobile: false,
    },
    
    // Emulation settings
    emulation: {
      // Enable/disable device emulation
      enabled: process.env.EMULATE_DEVICE === 'true',
      
      // Default device to emulate (from Playwright's device descriptors)
      defaultDevice: 'Desktop Chrome',
      
      // Custom device configurations
      customDevices: {
        'Desktop Chrome': {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          viewport: { width: 1920, height: 1080 },
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
        },
        // Add more custom devices as needed
      },
    },
    
    // Browser context options
    contextOptions: {
      // Enable/disable JavaScript
      javaScriptEnabled: true,
      
      // Ignore HTTPS errors
      ignoreHTTPSErrors: true,
      
      // Default navigation timeout
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10),
      
      // Default timeout for all page actions
      defaultTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000', 10),
      
      // Screenshot options
      screenshot: {
        // Take screenshots on test failure
        onFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
        
        // Screenshot quality (0-100)
        quality: 80,
        
        // Full page screenshots
        fullPage: true,
      },
      
      // Video recording options
      video: {
        // Record video for failing tests
        mode: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
        
        // Video size
        size: { width: 1920, height: 1080 },
      },
      
      // Tracing options
      trace: {
        // Record trace for failing tests
        mode: process.env.TRACE_ON_RETRY === 'true' ? 'on-first-retry' : 'off',
        
        // Trace options
        snapshots: true,
        screenshots: true,
        sources: true,
      },
    },
  },

  // ====== Reporting Configuration ======
  reporting: {
    // Base directory for all test artifacts
    outputDir: process.env.REPORT_PATH || path.join(process.cwd(), 'test-results'),
    
    // Reporters configuration
    reporters: [
      ['list'], // Console reporter
      ['html', { 
        open: 'never',
        outputFolder: path.join(process.env.REPORT_PATH || 'test-results', 'html-reports'),
      }],
      ['junit', { 
        outputFile: path.join(process.env.REPORT_PATH || 'test-results', 'junit', 'results.xml'),
      }],
      // Add more reporters as needed
    ],
    
    // Test result tracking
    testResults: {
      // Enable test result tracking
      enabled: true,
      
      // Test result storage
      storage: {
        // Local file system storage
        type: 'file',
        
        // Database storage (optional)
        // type: 'database',
        // connection: process.env.TEST_RESULT_DB_CONNECTION,
      },
      
      // Test result history
      history: {
        // Number of test runs to keep
        retention: parseInt(process.env.TEST_RESULT_RETENTION || '30', 10),
      },
    },
  },

  // ====== Environment Helpers ======
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
  isDevelopment: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  isCI: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',

  // ====== Helper Methods ======
  
  /**
   * Get the base URL for the current environment
   * @param {string} path - Optional path to append to the base URL
   * @returns {string} Full URL
   */
  getUrl(path = '') {
    const baseUrl = this.app.baseUrl;
    return `${baseUrl}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;
  },
  
  /**
   * Get the API URL for the current environment
   * @param {string} path - Optional path to append to the API URL
   * @returns {string} Full API URL
   */
  getApiUrl(path = '') {
    const apiBase = this.app.apiUrl;
    return `${apiBase}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;
  },
  
  /**
   * Get test user credentials
   * @param {string} role - User role (standard, admin, etc.)
   * @returns {Object} User credentials
   */
  getUser(role = 'standard') {
    const user = this.app.auth.credentials[role.toLowerCase()];
    if (!user) {
      throw new Error(`No test user found for role: ${role}`);
    }
    return { ...user }; // Return a copy to prevent modification of the original
  },
  
  /**
   * Get the path to a test data file
   * @param {string} fileName - Name of the test data file
   * @returns {string} Full path to the test data file
   */
  getTestDataPath(fileName) {
    return path.join(process.cwd(), 'test-data', fileName);
  },
  
  /**
   * Get the path to a test artifact
   * @param {string} type - Type of artifact (screenshots, videos, traces, etc.)
   * @param {string} fileName - Name of the artifact file
   * @returns {string} Full path to the artifact
   */
  getArtifactPath(type, fileName) {
    return path.join(this.reporting.outputDir, type, fileName);
  },
};
