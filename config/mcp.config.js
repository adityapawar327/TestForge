/**
 * TestForge - MCP Configuration
 * 
 * This module contains configuration for Microsoft Cloud Platform (MCP) integration.
 * All sensitive values should be provided via environment variables.
 * 
 * Required Environment Variables:
 * - MCP_CLIENT_ID: Azure AD application client ID
 * - MCP_CLIENT_SECRET: Azure AD application client secret
 * - MCP_TENANT_ID: Azure AD tenant ID
 * - MCP_TEST_DATA_ENDPOINT: Base URL for test data service
 * - MCP_AUTH_ENDPOINT: OAuth 2.0 token endpoint (defaults to common endpoint)
 */

module.exports = {
  // Environment (development, staging, production)
  env: process.env.NODE_ENV || 'development',
  
  // MCP API endpoints
  endpoints: {
    // Test data service endpoint
    testData: process.env.MCP_TEST_DATA_ENDPOINT || 'https://api.testforge.mcp.contoso.com/v1',
    
    // Authentication endpoint (Microsoft Identity Platform)
    auth: process.env.MCP_AUTH_ENDPOINT || 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    
    // Configuration management endpoint
    config: 'https://config.testforge.mcp.contoso.com/v1',
    
    // Feature flags endpoint
    featureFlags: 'https://feature-flags.testforge.mcp.contoso.com/v1',
  },
  
  // Authentication configuration
  auth: {
    // Azure AD application credentials
    clientId: process.env.MCP_CLIENT_ID || '00000000-0000-0000-0000-000000000000',
    clientSecret: process.env.MCP_CLIENT_SECRET || 'your-client-secret',
    tenantId: process.env.MCP_TENANT_ID || 'common',
    
    // OAuth 2.0 scopes
    scopes: [
      'https://testforge.mcp.contoso.com/.default',
      'offline_access'
    ],
    
    // Token caching
    cache: {
      enabled: true,
      ttl: 3000, // 50 minutes in seconds
    },
  },
  
  // Resource paths
  resources: {
    testData: {
      base: '/test-data',
      users: '/test-data/users',
      products: '/test-data/products',
      orders: '/test-data/orders',
    },
    configs: {
      base: '/configs',
      environments: '/configs/environments',
      testSuites: '/configs/test-suites',
    },
  },
  
  // Request configuration
  request: {
    // Default timeout for API requests (ms)
    timeout: parseInt(process.env.MCP_REQUEST_TIMEOUT) || 30000,
    
    // Retry configuration
    retry: {
      maxAttempts: 3,
      initialDelay: 1000, // ms
      maxDelay: 5000, // ms
      factor: 2, // Exponential backoff factor
      
      // HTTP status codes to retry
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      
      // HTTP methods to retry
      retryableMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    },
    
    // Request headers
    headers: {
      'User-Agent': 'TestForge/1.0.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  
  // Logging configuration
  logging: {
    level: process.env.MCP_LOG_LEVEL || 'info',
    format: process.env.MCP_LOG_FORMAT || 'json',
    
    // Log file configuration (if file logging is enabled)
    file: {
      enabled: process.env.MCP_LOG_TO_FILE === 'true',
      path: process.env.MCP_LOG_PATH || './logs/mcp-client.log',
      maxSize: '10m',
      maxFiles: '14d',
    },
  },
  
  // Feature flags
  features: {
    // Enable/disable MCP integration
    enabled: process.env.MCP_ENABLED !== 'false',
    
    // Enable/disable test data caching
    cacheTestData: true,
    
    // Enable/disable automatic token refresh
    autoRefreshToken: true,
    
    // Enable/disable request/response logging
    requestLogging: process.env.NODE_ENV !== 'production',
  },
  
  // Validation rules
  validation: {
    // Maximum number of test data records to fetch in a single request
    maxTestDataBatchSize: 100,
    
    // Maximum size of request/response payload (in bytes)
    maxPayloadSize: 5 * 1024 * 1024, // 5MB
  },
  
  // Get the base URL for the current environment
  getBaseUrl() {
    return this.endpoints.testData;
  },
  
  // Get the full URL for a resource
  getResourceUrl(resourcePath) {
    const baseUrl = this.getBaseUrl();
    return resourcePath.startsWith('http') 
      ? resourcePath 
      : `${baseUrl}${resourcePath.startsWith('/') ? '' : '/'}${resourcePath}`;
  },
};
