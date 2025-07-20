const { faker } = require('@faker-js/faker');

/**
 * TestForge Test Data Factory
 * 
 * Generates realistic test data for TestForge automated tests.
 * Uses Faker.js to create consistent, realistic test data.
 */
class TestDataFactory {
  constructor() {
    this.faker = faker;
    this.faker.seed(123); // For consistent test data across runs
  }

  // ====== User Data ======
  
  /**
   * Generate a test user with realistic data
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Test user object
   */
  createUser(overrides = {}) {
    const firstName = this.faker.person.firstName();
    const lastName = this.faker.person.lastName();
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    
    return {
      id: this.faker.string.uuid(),
      firstName,
      lastName,
      email: `${username}@testforge.contoso.com`,
      username,
      password: this.faker.internet.password({ 
        length: 16, 
        pattern: /[A-Za-z0-9]/, 
        prefix: 'P@ssw0rd!',
      }),
      role: 'tester',
      isActive: true,
      lastLogin: this.faker.date.recent().toISOString(),
      preferences: {
        theme: this.faker.helpers.arrayElement(['light', 'dark', 'system']),
        notifications: {
          email: this.faker.datatype.boolean(),
          slack: this.faker.datatype.boolean(),
          inApp: true
        },
        timezone: this.faker.location.timeZone()
      },
      createdAt: this.faker.date.past().toISOString(),
      updatedAt: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  // ====== Test Suite Data ======
  
  /**
   * Generate a test suite
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Test suite object
   */
  createTestSuite(overrides = {}) {
    const name = `Test Suite - ${this.faker.hacker.noun()}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    return {
      id: this.faker.string.uuid(),
      name,
      slug,
      description: this.faker.lorem.paragraph(),
      version: '1.0.0',
      ownerId: this.faker.string.uuid(),
      isPublic: this.faker.datatype.boolean(0.7), // 70% chance of being public
      tags: this.faker.helpers.arrayElements(
        ['e2e', 'api', 'ui', 'performance', 'security', 'smoke', 'regression'],
        this.faker.number.int({ min: 1, max: 3 })
      ),
      status: this.faker.helpers.arrayElement(['active', 'draft', 'archived']),
      metadata: {
        framework: 'playwright',
        language: 'typescript',
        browser: this.faker.helpers.arrayElement(['chromium', 'firefox', 'webkit', 'all']),
        timeout: 30000
      },
      createdAt: this.faker.date.past().toISOString(),
      updatedAt: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  // ====== Test Case Data ======
  
  /**
   * Generate a test case
   * @param {Object} suite - Parent test suite
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Test case object
   */
  createTestCase(suite = null, overrides = {}) {
    if (!suite) {
      suite = this.createTestSuite();
    }
    
    const name = `Test ${this.faker.hacker.verb()} ${this.faker.hacker.noun()}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    return {
      id: this.faker.string.uuid(),
      suiteId: suite.id,
      name,
      slug,
      description: this.faker.lorem.sentences(2),
      priority: this.faker.helpers.arrayElement(['critical', 'high', 'medium', 'low']),
      status: this.faker.helpers.arrayElement(['pass', 'fail', 'blocked', 'skipped', 'not_run']),
      steps: Array.from({ length: this.faker.number.int({ min: 3, max: 10 }) }, (_, i) => ({
        step: i + 1,
        action: `Step ${i + 1}: ${this.faker.hacker.phrase()}`,
        expected: `Expected: ${this.faker.hacker.phrase()}`,
        status: this.faker.helpers.arrayElement(['pass', 'fail', 'not_run']),
        comment: this.faker.datatype.boolean(0.3) ? this.faker.lorem.sentence() : undefined
      })),
      tags: this.faker.helpers.arrayElements(
        ['smoke', 'regression', 'sanity', 'performance', 'security'],
        this.faker.number.int({ min: 1, max: 2 })
      ),
      parameters: {
        browser: this.faker.helpers.arrayElement(['chromium', 'firefox', 'webkit']),
        viewport: this.faker.helpers.arrayElement(['desktop', 'tablet', 'mobile']),
        locale: 'en-US'
      },
      createdAt: this.faker.date.past().toISOString(),
      updatedAt: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  // ====== Test Execution Data ======
  
  /**
   * Generate a test execution
   * @param {Object} testCase - Test case being executed
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Test execution object
   */
  createTestExecution(testCase = null, overrides = {}) {
    if (!testCase) {
      const suite = this.createTestSuite();
      testCase = this.createTestCase(suite);
    }
    
    const status = this.faker.helpers.arrayElement(['passed', 'failed', 'skipped', 'pending', 'timedOut']);
    const startTime = this.faker.date.recent();
    const duration = this.faker.number.int({ min: 100, max: 10000 });
    
    return {
      id: this.faker.string.uuid(),
      testCaseId: testCase.id,
      suiteId: testCase.suiteId,
      name: testCase.name,
      status,
      startedAt: startTime.toISOString(),
      completedAt: new Date(startTime.getTime() + duration).toISOString(),
      duration,
      browser: this.faker.helpers.arrayElement(['chromium', 'firefox', 'webkit']),
      os: this.faker.helpers.arrayElement(['windows', 'macos', 'linux']),
      viewport: '1920x1080',
      retry: this.faker.number.int({ min: 0, max: 3 }),
      error: status === 'failed' ? this.faker.lorem.sentence() : null,
      stackTrace: status === 'failed' ? this.faker.lorem.paragraph() : null,
      videoUrl: status === 'failed' ? 'https://storage.testforge.contoso.com/videos/' + this.faker.string.uuid() + '.webm' : null,
      screenshotUrls: status === 'failed' ? [
        'https://storage.testforge.contoso.com/screenshots/' + this.faker.string.uuid() + '.png',
        'https://storage.testforge.contoso.com/screenshots/' + this.faker.string.uuid() + '.png'
      ] : [],
      logs: [
        { level: 'info', message: 'Test execution started', timestamp: startTime.toISOString() },
        { level: 'debug', message: 'Navigating to login page', timestamp: new Date(startTime.getTime() + 100).toISOString() },
        ...(status === 'failed' ? [
          { level: 'error', message: 'Element not found: #login-button', timestamp: new Date(startTime.getTime() + 500).toISOString() }
        ] : []),
        { 
          level: status === 'passed' ? 'info' : 'error', 
          message: `Test ${status} in ${duration}ms`, 
          timestamp: new Date(startTime.getTime() + duration).toISOString() 
        }
      ],
      metadata: {
        ci: this.faker.datatype.boolean(),
        ciJobId: this.faker.string.uuid(),
        git: {
          branch: this.faker.git.branch(),
          commit: this.faker.git.commitSha(),
          message: this.faker.git.commitMessage()
        },
        environment: this.faker.helpers.arrayElement(['dev', 'staging', 'production'])
      },
      ...overrides
    };
  }

  // ====== Test Environment Data ======
  
  /**
   * Generate a test environment configuration
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Test environment object
   */
  createTestEnvironment(overrides = {}) {
    const name = this.faker.helpers.arrayElement(['Development', 'Staging', 'Production', 'QA', 'UAT']);
    const slug = name.toLowerCase();
    
    return {
      id: this.faker.string.uuid(),
      name,
      slug,
      description: `${name} environment for testing`,
      baseUrl: `https://${slug}.testforge.contoso.com`,
      apiUrl: `https://api.${slug}.testforge.contoso.com/v1`,
      variables: {
        NODE_ENV: slug,
        API_KEY: this.faker.string.alphanumeric(32),
        ENABLE_ANALYTICS: this.faker.datatype.boolean().toString(),
        MAX_RETRIES: this.faker.number.int({ min: 1, max: 5 }).toString(),
        TIMEOUT: '30000',
        FEATURE_FLAGS: JSON.stringify({
          newDashboard: this.faker.datatype.boolean(),
          darkMode: this.faker.datatype.boolean(),
          notifications: this.faker.datatype.boolean(),
          experimental: this.faker.datatype.boolean(0.2)
        })
      },
      isActive: true,
      isDefault: slug === 'staging',
      createdAt: this.faker.date.past().toISOString(),
      updatedAt: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  // ====== API Mock Data ======
  
  /**
   * Generate a mock API response
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Response data
   * @param {Object} overrides - Custom properties to override defaults
   * @returns {Object} Mock API response
   */
  createApiResponse(endpoint, method = 'GET', data = null, overrides = {}) {
    const isError = overrides.status >= 400;
    const status = overrides.status || (isError ? this.faker.helpers.arrayElement([400, 401, 403, 404, 500]) : 200);
    
    const response = {
      status,
      statusText: isError 
        ? this.faker.helpers.arrayElement(['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'Internal Server Error'])
        : 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': this.faker.string.uuid(),
        'x-rate-limit-limit': '100',
        'x-rate-limit-remaining': this.faker.number.int({ min: 0, max: 100 }).toString(),
        'x-rate-limit-reset': Math.floor(Date.now() / 1000) + 3600,
        'x-trace-id': this.faker.string.uuid(),
        'x-response-time': `${this.faker.number.int({ min: 50, max: 500 })}ms`,
        ...(overrides.headers || {})
      },
      data: data,
      config: {
        url: endpoint,
        method: method.toLowerCase(),
        baseURL: 'https://api.testforge.contoso.com/v1',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.faker.string.alphanumeric(64)}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 30000,
        responseType: 'json',
        maxContentLength: -1,
        maxBodyLength: -1,
        validateStatus: null
      },
      request: {
        method: method.toUpperCase(),
        path: endpoint,
        protocol: 'https',
        host: 'api.testforge.contoso.com',
        timestamp: new Date().toISOString(),
        userAgent: this.faker.internet.userAgent(),
        ip: this.faker.internet.ip()
      },
      ...overrides
    };

    // For error responses
    if (isError) {
      response.data = {
        error: {
          code: `ERR_${status}`,
          message: this.faker.lorem.sentence(),
          details: this.faker.lorem.paragraph(),
          timestamp: new Date().toISOString(),
          path: endpoint,
          traceId: response.headers['x-trace-id'],
          documentationUrl: 'https://docs.testforge.contoso.com/errors',
          ...(response.data?.error || {})
        },
        ...(response.data || {})
      };
    }

    return response;
  }

  // ====== Paginated Response ======
  
  /**
   * Generate a paginated response
   * @param {Array} items - Array of items
   * @param {Object} options - Pagination options
   * @returns {Object} Paginated response
   */
  createPaginatedResponse(items, options = {}) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return {
      data: items.slice(startIndex, endIndex),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: endIndex < totalItems,
        hasPreviousPage: startIndex > 0,
        nextPage: endIndex < totalItems ? page + 1 : null,
        previousPage: startIndex > 0 ? page - 1 : null
      },
      links: {
        first: `?page=1&pageSize=${pageSize}`,
        last: `?page=${totalPages}&pageSize=${pageSize}`,
        next: endIndex < totalItems ? `?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: startIndex > 0 ? `?page=${page - 1}&pageSize=${pageSize}` : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        apiVersion: 'v1'
      }
    };
  }
  
  /**
   * Load test data from MCP and merge with generated data
   * @param {string} key - The test data key in MCP
   * @param {Object} overrides - Properties to override in the loaded data
   * @returns {Promise<Object>} Merged test data
   */
  async loadAndMergeTestData(key, overrides = {}) {
    try {
      const testDataManager = require('./testDataManager');
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
