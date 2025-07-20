const { test, expect } = require('@playwright/test');
const testOrchestrator = require('../../orchestration/testOrchestrator');
const testDataFactory = require('../../utils/testDataFactory');
const testDataSeeder = require('../../utils/testDataSeeder');

// Example of a complex test workflow using the test orchestrator
test.describe('Orchestrated Test Workflow', () => {
  // This test demonstrates a complex workflow with multiple steps and error handling
  test('should execute complex test workflow with orchestration', async ({ page }) => {
    // Define the test data
    const testUser = testDataFactory.createUser({ role: 'admin' });
    const testProduct = testDataFactory.createProduct({ inStock: true });
    
    // Define the workflow steps
    const workflowSteps = [
      // Step 1: Setup test data
      async (state) => {
        console.log('Setting up test data...');
        // Seed test user and product
        const [user, product] = await Promise.all([
          testDataSeeder.seed('users', testUser, { cleanup: true }),
          testDataSeeder.seed('products', testProduct, { cleanup: true })
        ]);
        
        return {
          testData: { user, product },
          testResults: [
            { step: 'setup', status: 'success', message: 'Test data setup completed' }
          ]
        };
      },
      
      // Step 2: Perform user login
      async (state, { page }) => {
        console.log('Performing user login...');
        await page.goto('https://example.com/login');
        
        // Simulate login (replace with actual selectors and actions)
        await page.fill('#email', state.testData.user.email);
        await page.fill('#password', state.testData.user.password);
        await page.click('button[type="submit"]');
        
        // Verify login success
        await page.waitForSelector('.dashboard', { timeout: 5000 });
        
        return {
          testResults: [
            ...state.testResults,
            { step: 'login', status: 'success', message: 'User logged in successfully' }
          ]
        };
      },
      
      // Step 3: Add product to cart
      async (state, { page }) => {
        console.log('Adding product to cart...');
        await page.goto(`/product/${state.testData.product.id}`);
        
        // Add to cart (replace with actual selectors)
        await page.click('button:has-text("Add to Cart")');
        
        // Verify cart update
        const cartCount = await page.textContent('.cart-count');
        
        return {
          testResults: [
            ...state.testResults,
            { 
              step: 'addToCart', 
              status: 'success', 
              message: 'Product added to cart',
              details: { cartCount: parseInt(cartCount, 10) }
            }
          ]
        };
      },
      
      // Step 4: Proceed to checkout
      async (state, { page }) => {
        console.log('Proceeding to checkout...');
        await page.click('a:has-text("Checkout")');
        
        // Fill shipping information
        await page.fill('#shipping-address', '123 Test St');
        await page.fill('#shipping-city', 'Test City');
        // ... other form fields
        
        await page.click('button:has-text("Continue to Payment")');
        
        return {
          testResults: [
            ...state.testResults,
            { step: 'checkout', status: 'success', message: 'Proceeded to checkout' }
          ]
        };
      },
      
      // Step 5: Complete the order
      async (state, { page }) => {
        console.log('Completing the order...');
        // Fill payment information
        await page.fill('#card-number', '4242424242424242');
        await page.fill('#expiry', '12/25');
        await page.fill('#cvc', '123');
        
        // Place order
        await page.click('button:has-text("Place Order")');
        
        // Verify order confirmation
        await page.waitForSelector('.order-confirmation', { timeout: 10000 });
        const orderNumber = await page.textContent('.order-number');
        
        return {
          orderNumber: orderNumber.trim(),
          testResults: [
            ...state.testResults,
            { 
              step: 'placeOrder', 
              status: 'success', 
              message: 'Order placed successfully',
              details: { orderNumber: orderNumber.trim() }
            }
          ]
        };
      }
    ];
    
    // Create and run the test scenario
    const scenario = testOrchestrator.createTestScenario(workflowSteps);
    const result = await scenario({
      testResults: [],
      testData: { user: testUser, product: testProduct }
    }, { page });
    
    // Log test results
    console.log('Test execution completed with results:', {
      orderNumber: result.orderNumber,
      steps: result.testResults.map(r => `${r.step}: ${r.status}`)
    });
    
    // Assert all steps completed successfully
    expect(result.testResults.every(r => r.status === 'success')).toBeTruthy();
    expect(result.orderNumber).toBeDefined();
    
    // Clean up test data
    await testDataSeeder.cleanup();
  });
  
  // This test demonstrates parallel test execution with different browsers
  test('should run tests in parallel across multiple browsers', async ({ browserManager }) => {
    const browsers = ['chromium', 'firefox', 'webkit'];
    const testConfigs = browsers.map(browser => ({
      browserType: browser,
      testData: {
        username: `testuser_${browser}`,
        product: testDataFactory.createProduct()
      }
    }));
    
    // Define a test scenario that will run in parallel for each browser
    const runBrowserTest = async (config) => {
      const { browserType, testData } = config;
      const browser = await browserManager.launchBrowser(browserType);
      const context = await browserManager.createContext();
      const page = await browserManager.createPage();
      
      try {
        console.log(`Running test in ${browserType}...`);
        
        // Example test steps
        await page.goto('https://example.com');
        await page.screenshot({ path: `test-results/${browserType}-homepage.png` });
        
        // Perform some actions with the test data
        await page.fill('#search', testData.product.name);
        await page.click('button[type="submit"]');
        
        // Verify search results
        const resultsCount = await page.$$eval('.search-result', els => els.length);
        console.log(`Found ${resultsCount} results in ${browserType}`);
        
        return {
          browserType,
          success: true,
          resultsCount
        };
      } catch (error) {
        console.error(`Error in ${browserType} test:`, error);
        return {
          browserType,
          success: false,
          error: error.message
        };
      } finally {
        await browser.close();
      }
    };
    
    // Run tests in parallel
    const results = await Promise.all(testConfigs.map(runBrowserTest));
    
    // Log and verify results
    results.forEach(result => {
      console.log(`${result.browserType} test ${result.success ? 'PASSED' : 'FAILED'}`);
      if (result.success) {
        console.log(`  - Found ${result.resultsCount} results`);
      } else {
        console.error(`  - Error: ${result.error}`);
      }
    });
    
    // Assert all tests passed
    const allPassed = results.every(r => r.success);
    expect(allPassed).toBeTruthy();
  });
});
