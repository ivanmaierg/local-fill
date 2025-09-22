import { test, expect } from '@playwright/test';

test.describe('Basic Extension Loading', () => {
  test('should load extension and inject content script', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Wait for content script to be injected
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Verify sidebar container exists
    const sidebar = page.locator('#local-fill-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Verify overlay script is loaded
    const overlayScript = page.locator('script[src*="overlay.js"]');
    await expect(overlayScript).toHaveCount(1);
  });

  test('should handle keyboard shortcut Alt+A', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Mock Chrome runtime to prevent errors
    await page.addInitScript(() => {
      (window as any).chrome = {
        runtime: {
          sendMessage: async () => ({ success: false }),
          getURL: (path: string) => `chrome-extension://test-id/${path}`,
          onMessage: { addListener: () => {} }
        }
      };
    });
    
    // Trigger keyboard shortcut
    await page.keyboard.press('Alt+a');
    
    // Should not cause any errors
    const errors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    expect(errors).toHaveLength(0);
  });

  test('should detect form fields on page load', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Verify form fields are present
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const phoneField = page.locator('#applicant\\.phone');
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(phoneField).toBeVisible();
  });

  test('should work with Lever form structure', async ({ page }) => {
    await page.goto('/fixtures/lever-basic.html');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Verify sidebar container exists
    const sidebar = page.locator('#local-fill-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Verify Lever form fields are present
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
  });

  test('should handle focus events on form fields', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Mock Chrome runtime
    await page.addInitScript(() => {
      (window as any).chrome = {
        runtime: {
          sendMessage: async () => ({ success: false }),
          getURL: (path: string) => `chrome-extension://test-id/${path}`,
          onMessage: { addListener: () => {} }
        }
      };
    });
    
    // Focus on form fields
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    
    await nameField.click();
    await nameField.focus();
    
    await emailField.click();
    await emailField.focus();
    
    // Should not cause any errors
    const errors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    expect(errors).toHaveLength(0);
  });

  test('should handle pages without forms gracefully', async ({ page }) => {
    await page.setContent('<html><body><h1>No forms here</h1></body></html>');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Extension should still load sidebar
    const sidebar = page.locator('#local-fill-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Should not cause any errors
    const errors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    expect(errors).toHaveLength(0);
  });

  test('should inject overlay script correctly', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Wait for extension to load
    await page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Check that overlay script is injected
    const overlayScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => script.src.includes('overlay.js'));
    });
    
    expect(overlayScript).toBe(true);
  });
});
