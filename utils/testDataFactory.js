const faker = require('faker');
const testDataManager = require('./testDataManager');

class TestDataFactory {
  constructor() {
    // Initialize faker with a specific seed for consistent test data
    faker.seed(123);
  }

  /**
   * Generate test user data
   * @param {Object} overrides - Properties to override in the generated user
   * @returns {Object} Generated user data
   */
  createUser(overrides = {}) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName, 'test.com').toLowerCase();
    const username = faker.internet.userName(firstName, lastName).toLowerCase();
    
    return {
      id: faker.datatype.uuid(),
      firstName,
      lastName,
      email,
      username,
      password: 'Test@123', // Default password that meets common validation rules
      phone: faker.phone.phoneNumber('###-###-####'),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zipCode: faker.address.zipCode('#####'),
        country: 'US',
      },
      ...overrides,
    };
  }

  /**
   * Generate product test data
   * @param {Object} overrides - Properties to override in the generated product
   * @returns {Object} Generated product data
   */
  createProduct(overrides = {}) {
    const productName = faker.commerce.productName();
    const department = faker.commerce.department();
    
    return {
      id: faker.datatype.uuid(),
      name: productName,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price(10, 1000, 2)),
      category: department.toLowerCase().replace(/\s+/g, '-'),
      sku: faker.random.alphaNumeric(10).toUpperCase(),
      inStock: faker.datatype.boolean(),
      stockQuantity: faker.datatype.number({ min: 0, max: 1000 }),
      rating: faker.datatype.number({ min: 0, max: 5, precision: 0.1 }),
      ...overrides,
    };
  }

  /**
   * Generate order test data
   * @param {Object} options - Options for order generation
   * @param {Array} options.products - Array of products to include in the order
   * @param {Object} overrides - Properties to override in the generated order
   * @returns {Object} Generated order data
   */
  createOrder({ products = [], ...overrides } = {}) {
    const orderProducts = products.length > 0 
      ? products 
      : Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => ({
          productId: faker.datatype.uuid(),
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price(10, 1000, 2)),
          quantity: faker.datatype.number({ min: 1, max: 10 }),
        }));

    const subtotal = orderProducts.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping for orders over $100
    const total = subtotal + tax + shipping;

    return {
      id: faker.datatype.uuid(),
      orderNumber: `ORD-${faker.random.alphaNumeric(8).toUpperCase()}`,
      customerId: faker.datatype.uuid(),
      orderDate: new Date().toISOString(),
      status: 'pending',
      items: orderProducts,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: {
        fullName: faker.name.findName(),
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zipCode: faker.address.zipCode('#####'),
        country: 'US',
      },
      billingAddress: {},
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      ...overrides,
    };
  }

  /**
   * Generate API request payload
   * @param {string} endpoint - The API endpoint
   * @param {string} method - The HTTP method
   * @param {Object} data - The request data
   * @returns {Object} The API request payload
   */
  createApiRequest(endpoint, method = 'GET', data = {}) {
    return {
      url: endpoint,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + faker.datatype.uuid(),
      },
      data,
    };
  }

  /**
   * Generate API response
   * @param {Object} options - Response options
   * @param {number} options.status - HTTP status code
   * @param {*} options.data - Response data
   * @param {Object} options.error - Error details if any
   * @returns {Object} The API response
   */
  createApiResponse({ status = 200, data = null, error = null } = {}) {
    return {
      status,
      statusText: this._getStatusText(status),
      headers: {
        'content-type': 'application/json',
      },
      data,
      error,
    };
  }

  /**
   * Get status text for HTTP status code
   * @private
   * @param {number} status - HTTP status code
   * @returns {string} Status text
   */
  _getStatusText(status) {
    const statusMap = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    return statusMap[status] || 'Unknown';
  }

  /**
   * Load test data from MCP and merge with generated data
   * @param {string} key - The test data key in MCP
   * @param {Object} overrides - Properties to override in the loaded data
   * @returns {Promise<Object>} Merged test data
   */
  async loadAndMergeTestData(key, overrides = {}) {
    try {
      const data = await testDataManager.getTestData(key);
      return { ...data, ...overrides };
    } catch (error) {
      console.warn(`Failed to load test data for key: ${key}`, error);
      return overrides;
    }
  }
}

// Create a singleton instance
const testDataFactory = new TestDataFactory();

module.exports = testDataFactory;
