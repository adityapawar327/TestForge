const axios = require('axios');
const testDataFactory = require('./testDataFactory');
const mcpClient = require('./mcpClient');

class TestDataSeeder {
  constructor() {
    this.createdData = new Map();
  }

  /**
   * Seed test data for a specific entity
   * @param {string} entity - The entity name (e.g., 'users', 'products')
   * @param {Object|Array} data - The data to seed
   * @param {Object} options - Options for seeding
   * @param {boolean} [options.cleanup=true] - Whether to track for cleanup
   * @returns {Promise<Object|Array>} The seeded data with IDs
   */
  async seed(entity, data, { cleanup = true } = {}) {
    try {
      // If data is an array, seed each item
      if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
          const result = await this._seedSingle(entity, item, { cleanup });
          results.push(result);
        }
        return results;
      }
      
      // Single item
      return this._seedSingle(entity, data, { cleanup });
    } catch (error) {
      console.error(`Failed to seed ${entity} data:`, error);
      throw error;
    }
  }

  /**
   * Seed a single entity
   * @private
   */
  async _seedSingle(entity, data, { cleanup }) {
    // In a real implementation, this would make an API call to create the entity
    // For now, we'll simulate the API response
    const response = await this._simulateApiCall('POST', `/${entity}`, data);
    
    // Track the created data for cleanup if requested
    if (cleanup) {
      if (!this.createdData.has(entity)) {
        this.createdData.set(entity, []);
      }
      this.createdData.get(entity).push({ id: response.data.id });
    }
    
    return response.data;
  }

  /**
   * Clean up all seeded data
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Process cleanup in reverse order to handle foreign key constraints
    const entities = Array.from(this.createdData.entries()).reverse();
    
    for (const [entity, items] of entities) {
      for (const item of items) {
        try {
          // In a real implementation, this would make an API call to delete the entity
          await this._simulateApiCall('DELETE', `/${entity}/${item.id}`);
          console.log(`Cleaned up ${entity} with ID: ${item.id}`);
        } catch (error) {
          console.error(`Failed to clean up ${entity} with ID ${item.id}:`, error);
        }
      }
    }
    
    // Clear the tracking
    this.createdData.clear();
  }

  /**
   * Simulate an API call
   * @private
   */
  async _simulateApiCall(method, url, data = null) {
    // In a real implementation, this would make an actual API call
    console.log(`[MOCK API] ${method} ${url}`, data || '');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For POST requests, return the data with a generated ID
    if (method.toUpperCase() === 'POST') {
      return {
        status: 201,
        statusText: 'Created',
        data: {
          ...data,
          id: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    
    // For DELETE requests, return success
    if (method.toUpperCase() === 'DELETE') {
      return {
        status: 204,
        statusText: 'No Content',
        data: null,
      };
    }
    
    // For GET requests, return mock data
    return {
      status: 200,
      statusText: 'OK',
      data: [],
    };
  }

  /**
   * Load test data from MCP and seed it
   * @param {string} key - The test data key in MCP
   * @param {Object} options - Options for seeding
   * @returns {Promise<Object|Array>} The seeded data
   */
  async seedFromMCP(key, options = {}) {
    try {
      const data = await mcpClient.getTestData(key);
      return this.seed(key, data, options);
    } catch (error) {
      console.error(`Failed to seed data from MCP key '${key}':`, error);
      throw error;
    }
  }

  /**
   * Generate and seed test data using the test data factory
   * @param {string} type - The type of data to generate ('user', 'product', 'order')
   * @param {Object} overrides - Properties to override in the generated data
   * @param {Object} options - Options for seeding
   * @returns {Promise<Object>} The seeded data
   */
  async generateAndSeed(type, overrides = {}, options = {}) {
    let data;
    
    switch (type.toLowerCase()) {
      case 'user':
        data = testDataFactory.createUser(overrides);
        break;
      case 'product':
        data = testDataFactory.createProduct(overrides);
        break;
      case 'order':
        data = testDataFactory.createOrder(overrides);
        break;
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
    
    return this.seed(`${type}s`, data, options);
  }
}

// Create a singleton instance
const testDataSeeder = new TestDataSeeder();

// Handle process termination to ensure cleanup
process.on('exit', async () => {
  if (testDataSeeder.createdData.size > 0) {
    console.log('Cleaning up test data before exit...');
    await testDataSeeder.cleanup();
  }
});

// Handle CTRL+C
process.on('SIGINT', async () => {
  if (testDataSeeder.createdData.size > 0) {
    console.log('Cleaning up test data before exit...');
    await testDataSeeder.cleanup();
  }
  process.exit(0);
});

module.exports = testDataSeeder;
