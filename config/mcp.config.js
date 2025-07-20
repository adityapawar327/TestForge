/**
 * MCP Configuration
 * This file contains the configuration for MCP (Microsoft Cloud Platform) integration
 */

module.exports = {
  // MCP API endpoints
  endpoints: {
    testData: process.env.MCP_TEST_DATA_ENDPOINT || 'https://api.mcp.microsoft.com/test-data',
    auth: process.env.MCP_AUTH_ENDPOINT || 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
  
  // Authentication configuration
  auth: {
    clientId: process.env.MCP_CLIENT_ID,
    clientSecret: process.env.MCP_CLIENT_SECRET,
    scope: 'https://api.mcp.microsoft.com/.default',
  },
  
  // Resource paths
  resources: {
    testData: '/test-data',
    configs: '/configs',
    environments: '/environments',
  },
  
  // Default request timeout (ms)
  timeout: 30000,
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000, // ms
  },
  
  // Logging configuration
  logging: {
    level: process.env.MCP_LOG_LEVEL || 'info',
    format: 'json',
  },
};
