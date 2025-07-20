const { StateGraph, END } = require('@langchain/langgraph');
const { RunnableLambda } = require('@langchain/core/runnables');
const testDataManager = require('../utils/testDataManager');
const browserManager = require('../utils/browserManager');

class TestOrchestrator {
  constructor() {
    this.workflow = null;
    this.state = {
      testResults: [],
      testData: {},
      browserContexts: {},
      errors: [],
    };
    
    this._initializeWorkflow();
  }

  /**
   * Initialize the test workflow
   * @private
   */
  _initializeWorkflow() {
    // Define the state schema
    const stateSchema = {
      testResults: {
        value: [],
        reducer: (existing, updates) => [...existing, ...updates],
      },
      testData: {
        value: {},
        // Merge test data objects
        reducer: (existing, updates) => ({ ...existing, ...updates }),
      },
      browserContexts: {
        value: {},
        // Merge browser contexts
        reducer: (existing, updates) => ({ ...existing, ...updates }),
      },
      errors: {
        value: [],
        reducer: (existing, updates) => [...existing, ...updates],
      },
    };

    // Create a new workflow
    this.workflow = new StateGraph(stateSchema);

    // Define nodes
    this.workflow.addNode('setupTestData', this._setupTestData.bind(this));
    this.workflow.addNode('setupBrowser', this._setupBrowser.bind(this));
    this.workflow.addNode('executeTest', this._executeTest.bind(this));
    this.workflow.addNode('teardown', this._teardown.bind(this));
    this.workflow.addNode('handleError', this._handleError.bind(this));

    // Define edges
    this.workflow.addEdge('setupTestData', 'setupBrowser');
    this.workflow.addEdge('setupBrowser', 'executeTest');
    this.workflow.addEdge('executeTest', 'teardown');
    
    // Add error handling edges
    this.workflow.addEdge('setupTestData', 'handleError');
    this.workflow.addEdge('setupBrowser', 'handleError');
    this.workflow.addEdge('executeTest', 'handleError');
    this.workflow.addEdge('handleError', 'teardown');
    
    // Set entry point
    this.workflow.setEntryPoint('setupTestData');
    
    // Set finish point
    this.workflow.setFinishPoint('teardown');
    
    // Compile the workflow
    this.compiledWorkflow = this.workflow.compile();
  }

  /**
   * Setup test data for the test run
   * @private
   */
  async _setupTestData(state) {
    try {
      console.log('Setting up test data...');
      // Load test data from MCP or use default
      const testData = await testDataManager.getTestData('test-config', { cache: true });
      
      return {
        testData,
        testResults: [{ step: 'setupTestData', status: 'success', timestamp: new Date().toISOString() }],
      };
    } catch (error) {
      console.error('Failed to setup test data:', error);
      return {
        errors: [{
          step: 'setupTestData',
          error: error.message,
          timestamp: new Date().toISOString(),
        }],
      };
    }
  }

  /**
   * Setup browser for testing
   * @private
   */
  async _setupBrowser(state) {
    try {
      console.log('Setting up browser...');
      // Initialize browser manager if needed
      if (browserManager.browserConfigs.size === 0) {
        await browserManager.initialize();
      }
      
      // Launch browser and create context
      const browser = await browserManager.launchBrowser('chromium');
      const context = await browserManager.createContext();
      const page = await browserManager.createPage();
      
      return {
        browserContexts: {
          default: { browser, context, page },
        },
        testResults: [
          ...state.testResults,
          { step: 'setupBrowser', status: 'success', timestamp: new Date().toISOString() },
        ],
      };
    } catch (error) {
      console.error('Failed to setup browser:', error);
      return {
        ...state,
        errors: [
          ...(state.errors || []),
          {
            step: 'setupBrowser',
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Execute the test
   * @private
   */
  async _executeTest(state) {
    const { testData, browserContexts } = state;
    const { page } = browserContexts.default;
    
    try {
      console.log('Executing test...');
      
      // Example test: Navigate to a page and take a screenshot
      await page.goto(testData.baseUrl || 'https://example.com');
      await page.screenshot({ path: 'test-results/screenshot.png' });
      
      // Example assertion
      const title = await page.title();
      const testPassed = title.includes('Example');
      
      return {
        testResults: [
          ...state.testResults,
          {
            step: 'executeTest',
            status: testPassed ? 'success' : 'failed',
            details: { title },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } catch (error) {
      console.error('Test execution failed:', error);
      return {
        ...state,
        errors: [
          ...(state.errors || []),
          {
            step: 'executeTest',
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Handle errors during test execution
   * @private
   */
  async _handleError(state) {
    console.error('Error in test execution:', state.errors);
    return {
      ...state,
      testResults: [
        ...state.testResults,
        {
          step: 'handleError',
          status: 'error',
          errors: state.errors,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Clean up resources after test execution
   * @private
   */
  async _teardown(state) {
    console.log('Tearing down test...');
    
    // Close browser contexts
    if (state.browserContexts) {
      for (const context of Object.values(state.browserContexts)) {
        try {
          if (context.browser) {
            await context.browser.close();
          }
        } catch (error) {
          console.error('Error during browser teardown:', error);
        }
      }
    }
    
    return {
      ...state,
      testResults: [
        ...state.testResults,
        {
          step: 'teardown',
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Run the test workflow
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async runTest(options = {}) {
    try {
      console.log('Starting test workflow...');
      
      // Initialize state with options
      const initialState = {
        ...this.state,
        testData: { ...options },
      };
      
      // Execute the workflow
      const result = await this.compiledWorkflow.invoke(initialState);
      
      // Log final results
      console.log('Test execution completed with results:', {
        totalSteps: result.testResults.length,
        success: result.testResults.every(r => r.status === 'success'),
        errors: result.errors,
      });
      
      return result;
    } catch (error) {
      console.error('Test workflow failed:', error);
      
      // Ensure resources are cleaned up even if workflow fails
      await this._teardown({
        ...this.state,
        errors: [
          ...(this.state.errors || []),
          {
            step: 'runTest',
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      
      throw error;
    }
  }
  
  /**
   * Create a test scenario with multiple steps
   * @param {Array<Function>} steps - Array of test step functions
   * @returns {Function} Composed test function
   */
  createTestScenario(steps) {
    return async (state) => {
      const results = [];
      let currentState = { ...state };
      
      for (const [index, step] of steps.entries()) {
        try {
          const result = await step(currentState);
          currentState = { ...currentState, ...result };
          results.push({
            step: `step_${index}`,
            status: 'success',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          results.push({
            step: `step_${index}`,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          
          return {
            ...currentState,
            testResults: [...(currentState.testResults || []), ...results],
            errors: [
              ...(currentState.errors || []),
              {
                step: `step_${index}`,
                error: error.message,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
      }
      
      return {
        ...currentState,
        testResults: [...(currentState.testResults || []), ...results],
      };
    };
  }
}

// Create a singleton instance
const testOrchestrator = new TestOrchestrator();

module.exports = testOrchestrator;
