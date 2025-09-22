import { test as base, expect } from '@playwright/test';

// Extend the base test with custom functionality
export const test = base.extend({
  // Add any custom fixtures here if needed
});

// Global setup for all tests
test.beforeAll(async () => {
  console.log('Setting up Playwright tests for Local-Fill extension');
});

// Global teardown for all tests
test.afterAll(async () => {
  console.log('Cleaning up Playwright tests');
});

// Add error handling for console errors
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Make errors available to tests
  await page.addInitScript(() => {
    window.consoleErrors = [];
    
    const originalError = console.error;
    console.error = (...args) => {
      window.consoleErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
  });
});

// Add visual comparison utilities
export const visualTest = test.extend({
  // Add visual testing capabilities
  takeScreenshot: async ({ page }, use) => {
    const takeScreenshot = async (name: string) => {
      await page.screenshot({ 
        path: `test-results/screenshots/${name}.png`,
        fullPage: true 
      });
    };
    await use(takeScreenshot);
  }
});

// Export test utilities
export { expect };
