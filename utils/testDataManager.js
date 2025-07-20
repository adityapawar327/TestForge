const mcpClient = require('./mcpClient');

class TestDataManager {
  constructor() {
    this.testDataCache = new Map();
  }

  /**
   * Get test data by key with optional caching
   * @param {string} key - The test data key
   * @param {Object} options - Options for fetching test data
   * @param {boolean} [options.cache=true] - Whether to cache the result
   * @param {boolean} [options.refresh=false] - Whether to force refresh the cache
   * @returns {Promise<Object>} The test data
   */
  async getTestData(key, { cache = true, refresh = false } = {}) {
    // Return cached data if available and not refreshing
    if (cache && !refresh && this.testDataCache.has(key)) {
      return this.testDataCache.get(key);
    }

    try {
      const data = await mcpClient.getTestData(key);
      
      // Cache the result if caching is enabled
      if (cache) {
        this.testDataCache.set(key, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to get test data for key: ${key}`, error);
      throw new Error(`Test data not found for key: ${key}`);
    }
  }

  /**
   * Get a specific value from test data using a path
   * @param {string} key - The test data key
   * @param {string} path - Dot notation path to the value (e.g., 'user.profile.email')
   * @param {Object} options - Options for fetching test data
   * @returns {Promise<*>} The value at the specified path
   */
  async getValue(key, path, options = {}) {
    const data = await this.getTestData(key, options);
    
    // Handle dot notation path (e.g., 'user.profile.email')
    return path.split('.').reduce((obj, prop) => {
      if (obj && obj[prop] !== undefined) {
        return obj[prop];
      }
      throw new Error(`Path '${path}' not found in test data '${key}'`);
    }, data);
  }

  /**
   * Clear the test data cache
   * @param {string} [key] - Optional key to clear specific test data, or clear all if not provided
   */
  clearCache(key) {
    if (key) {
      this.testDataCache.delete(key);
    } else {
      this.testDataCache.clear();
    }
  }

  /**
   * Generate test data using a template
   * @param {Object} template - The template object
   * @param {Object} [overrides] - Values to override in the template
   * @returns {Object} The generated test data
   */
  generateTestData(template, overrides = {}) {
    return { ...template, ...overrides };
  }
}

// Create a singleton instance
const testDataManager = new TestDataManager();

module.exports = testDataManager;
