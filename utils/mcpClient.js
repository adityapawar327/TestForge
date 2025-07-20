const axios = require('axios');
const mcpConfig = require('../config/mcp.config');
const { v4: uuidv4 } = require('uuid');

class MCPClient {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.axiosInstance = axios.create({
      baseURL: mcpConfig.endpoints.testData,
      timeout: mcpConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': uuidv4(),
      },
    });
    
    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (!this.accessToken || this.tokenExpiry < Date.now()) {
          await this.authenticate();
        }
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If unauthorized, try to refresh token once
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.authenticate();
          originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
          return this.axiosInstance(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  async authenticate() {
    try {
      const response = await axios.post(
        mcpConfig.endpoints.auth,
        new URLSearchParams({
          client_id: mcpConfig.auth.clientId,
          client_secret: mcpConfig.auth.clientSecret,
          scope: mcpConfig.auth.scope,
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
    } catch (error) {
      console.error('MCP Authentication failed:', error.message);
      throw new Error('Failed to authenticate with MCP');
    }
  }
  
  // Test Data Methods
  async getTestData(key, options = {}) {
    try {
      const response = await this.axiosInstance.get(
        `${mcpConfig.resources.testData}/${key}`,
        { params: options }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch test data for key: ${key}`, error);
      throw error;
    }
  }
  
  // Configuration Methods
  async getConfig(configName, environment = 'default') {
    try {
      const response = await this.axiosInstance.get(
        `${mcpConfig.resources.configs}/${configName}`,
        { params: { environment } }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch config: ${configName}`, error);
      throw error;
    }
  }
  
  // Environment Methods
  async getEnvironmentConfig(environment) {
    try {
      const response = await this.axiosInstance.get(
        `${mcpConfig.resources.environments}/${environment}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch environment config: ${environment}`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const mcpClient = new MCPClient();

module.exports = mcpClient;
