# Playwright MCP Test Automation Framework

[![Node.js CI](https://github.com/your-org/playwright-mcp-framework/actions/workflows/node.js.yml/badge.svg)](https://github.com/your-org/playwright-mcp-framework/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/your-org/playwright-mcp-framework/branch/main/graph/badge.svg?token=YOUR-TOKEN-HERE)](https://codecov.io/gh/your-org/playwright-mcp-framework)

An advanced, scalable, and maintainable test automation framework built with Playwright and Microsoft Cloud Platform (MCP) integration. This framework is designed for end-to-end testing of modern web applications with built-in support for cross-browser testing, test data management, and intelligent test orchestration.

## ✨ Features

- 🖥️ **Cross-Browser Testing**: Out-of-the-box support for Chromium, Firefox, and WebKit
- ☁️ **MCP Integration**: Seamless integration with Microsoft Cloud Platform for test data and configuration
- 🤖 **Smart Test Orchestration**: Powered by LangGraph for complex test workflows and parallel execution
- 📊 **Comprehensive Reporting**: Built-in HTML, JUnit, and custom reporting
- 🔄 **Test Data Management**: Advanced test data generation and management
- 🧩 **Page Object Model**: Clean and maintainable test architecture
- ⚡ **Performance Testing**: Built-in support for performance metrics collection
- 🔒 **Security Testing**: Integration with security scanning tools
- 🖼️ **Visual Regression Testing**: Screenshot comparison for UI testing
- 🚀 **CI/CD Ready**: Pre-configured for popular CI/CD platforms

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- npm 8 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityapawar327/TestForge.git
   cd TestForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🏃 Running Tests

### Basic Commands

```bash
# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run tests in debug mode
npx playwright test --debug

# Run tests in a specific browser
npx playwright test --project=chromium

# Run a specific test file
npx playwright test tests/examples/mcpIntegration.spec.js

# Run tests in headed mode
HEADLESS=false npx playwright test
```

## 🏗️ Project Structure

```
.
├── .github/              # GitHub Actions workflows
├── config/               # Configuration files
│   ├── mcp.config.js     # MCP client configuration
├── pages/                # Page Object Models
├── tests/                # Test suites
│   ├── examples/         # Example test cases
│   ├── smoke/            # Smoke tests
│   └── specs/            # Feature test suites
├── utils/                # Utility functions
│   ├── browserManager.js # Browser management
│   ├── testDataFactory.js # Test data generation
│   ├── testDataManager.js # Test data management
│   └── testDataSeeder.js # Test data seeding
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── playwright.config.js  # Playwright configuration
```

## 📚 Documentation

For detailed documentation, please refer to:

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Quick start guide
- [API Reference](./docs/API_REFERENCE.md) - Detailed API documentation
- [Examples](./tests/examples/) - Example test implementations

## 🧪 Example Test

```javascript
const { test, expect } = require('../../fixtures/test.fixture');
const testDataFactory = require('../../utils/testDataFactory');

test.describe('Example Test Suite', () => {
  test('should demonstrate framework features', async ({ page, testData }) => {
    // Generate test data
    const user = testDataFactory.createUser({ role: 'admin' });
    
    // Navigate to application
    await page.goto('https://example.com');
    
    // Perform actions
    await page.fill('#username', user.username);
    await page.fill('#password', user.password);
    await page.click('button[type="submit"]');
    
    // Assertions
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.welcome-message')).toContainText(`Welcome, ${user.firstName}`);
  });
});
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Test data management with [Faker](https://fakerjs.dev/)
- Test orchestration with [LangGraph](https://langchain-ai.github.io/langgraph/)

---

<div align="center">
  Made with ❤️ by Aditya Pawar
</div>
