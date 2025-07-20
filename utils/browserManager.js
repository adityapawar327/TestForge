const { chromium, firefox, webkit, devices } = require('@playwright/test');
const mcpClient = require('./mcpClient');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.browserConfigs = new Map();
  }

  /**
   * Initialize browser configurations from MCP
   */
  async initialize() {
    try {
      // Fetch browser configurations from MCP
      const configs = await mcpClient.getConfig('browser-configs');
      
      // Store each browser configuration
      for (const [browserName, config] of Object.entries(configs)) {
        this.browserConfigs.set(browserName, config);
      }
      
      console.log('Browser configurations loaded successfully');
    } catch (error) {
      console.warn('Failed to load browser configurations from MCP, using defaults', error);
      // Set default configurations if MCP is not available
      this.setDefaultConfigs();
    }
  }

  /**
   * Set default browser configurations
   */
  setDefaultConfigs() {
    this.browserConfigs.set('chromium', {
      type: 'chromium',
      headless: process.env.HEADLESS !== 'false',
      viewport: { width: 1920, height: 1080 },
      defaultTimeout: 30000,
      launchOptions: {
        args: ['--disable-dev-shm-usage', '--no-sandbox'],
      },
    });

    this.browserConfigs.set('firefox', {
      type: 'firefox',
      headless: process.env.HEADLESS !== 'false',
      viewport: { width: 1920, height: 1080 },
      defaultTimeout: 30000,
    });

    this.browserConfigs.set('webkit', {
      type: 'webkit',
      headless: process.env.HEADLESS !== 'false',
      viewport: { width: 1920, height: 1080 },
      defaultTimeout: 30000,
    });
  }

  /**
   * Get browser launcher based on browser type
   * @param {string} browserType - The type of browser (chromium, firefox, webkit)
   * @returns {Object} The browser launcher
   */
  getBrowserLauncher(browserType) {
    const launchers = {
      chromium,
      firefox,
      webkit,
    };

    const launcher = launchers[browserType];
    if (!launcher) {
      throw new Error(`Unsupported browser type: ${browserType}`);
    }
    return launcher;
  }

  /**
   * Launch a browser with the specified configuration
   * @param {string} browserType - The type of browser to launch
   * @param {Object} options - Additional launch options
   * @returns {Promise<Object>} The browser instance
   */
  async launchBrowser(browserType = 'chromium', options = {}) {
    const config = { ...(this.browserConfigs.get(browserType) || {}), ...options };
    const launcher = this.getBrowserLauncher(browserType);
    
    console.log(`Launching ${browserType} browser...`);
    
    this.browser = await launcher.launch({
      headless: config.headless,
      ...(config.launchOptions || {}),
    });

    return this.browser;
  }

  /**
   * Create a new browser context
   * @param {Object} options - Context options
   * @returns {Promise<Object>} The browser context
   */
  async createContext(options = {}) {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launchBrowser() first.');
    }

    const defaultOptions = {
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: 'test-results/videos/' },
    };

    this.context = await this.browser.newContext({
      ...defaultOptions,
      ...options,
    });

    return this.context;
  }

  /**
   * Create a new page in the current context
   * @returns {Promise<Object>} The page object
   */
  async createPage() {
    if (!this.context) {
      this.context = await this.createContext();
    }

    this.page = await this.context.newPage();
    return this.page;
  }

  /**
   * Close the current page
   */
  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  /**
   * Close the browser and all its contexts
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  /**
   * Get a mobile device configuration
   * @param {string} deviceName - Name of the mobile device
   * @returns {Object} Device configuration
   */
  getMobileDevice(deviceName) {
    const device = devices[deviceName];
    if (!device) {
      throw new Error(`Device '${deviceName}' not found in Playwright devices`);
    }
    return device;
  }
}

// Create a singleton instance
const browserManager = new BrowserManager();

// Initialize with default configs
browserManager.setDefaultConfigs();

module.exports = browserManager;
