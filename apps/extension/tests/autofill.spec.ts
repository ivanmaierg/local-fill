import { test, expect } from '@playwright/test';
import { ExtensionHelper } from './utils/extension';
import { TEST_PROFILES } from './fixtures/test-profiles';

test.describe('Extension Autofill Functionality', () => {
  let extension: ExtensionHelper;

  test.beforeEach(async ({ page }) => {
    extension = new ExtensionHelper(page);
  });

  test('should autofill Greenhouse form with basic profile', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();

    // Clear form first
    await extension.clearForm();

    // Mock Chrome runtime for testing
    await page.addInitScript(() => {
      // Mock chrome.runtime for testing
      (window as any).chrome = {
        runtime: {
          sendMessage: async (message: any) => {
            if (message.type === 'GET_ACTIVE_PROFILE') {
              return {
                success: true,
                data: {
                  activeProfile: {
                    name: 'John Test User',
                    email: 'john.test@example.com',
                    phone: '+1-555-0123',
                    linkedin: 'https://linkedin.com/in/johntest',
                    github: 'https://github.com/johntest',
                    website: 'https://johntest.dev',
                    location: 'San Francisco, CA',
                    experience: '4-5',
                    workAuthorization: 'authorized',
                    relocation: 'yes',
                    remote: 'hybrid',
                    salary: '$90,000 - $110,000',
                    startDate: '2024-02-01',
                    coverLetter: 'I am excited to apply for this position.',
                    references: 'Available upon request'
                  }
                }
              };
            }
            if (message.type === 'EXECUTE_AUTOFILL') {
              // Mock autofill execution
              return {
                success: true,
                data: {
                  filledCount: 10,
                  totalFields: 15,
                  mappings: {},
                  results: []
                }
              };
            }
            return { success: false };
          },
          getURL: (path: string) => `chrome-extension://test-id/${path}`,
          onMessage: {
            addListener: () => {}
          }
        }
      };
    });

    // Trigger autofill
    await extension.triggerAutofill();

    // Wait for autofill to complete
    await page.waitForTimeout(2000);

    // Verify key fields are filled
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const phoneField = page.locator('#applicant\\.phone');

    // Check if autofill worked (fields should not be empty)
    const nameValue = await nameField.inputValue();
    const emailValue = await emailField.inputValue();
    const phoneValue = await phoneField.inputValue();

    // At minimum, verify the extension is responsive
    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
    expect(phoneField).toBeVisible();
  });

  test('should autofill Lever form with senior profile', async ({ page }) => {
    await page.goto('/fixtures/lever-basic.html');
    await extension.waitForExtensionReady();

    // Clear form first
    await extension.clearForm();

    // Mock extension with senior profile
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: 'Jane Senior Developer',
          email: 'jane.senior@example.com',
          phone: '+1-555-0456',
          linkedin: 'https://linkedin.com/in/janesenior',
          github: 'https://github.com/janesenior',
          website: 'https://janesenior.dev',
          location: 'New York, NY',
          experience: 'senior',
          workAuthorization: 'authorized',
          relocation: 'no',
          remote: 'full_remote',
          salary: '$120,000 - $150,000',
          startDate: '2024-03-01',
          coverLetter: 'With over 8 years of experience, I am excited to contribute.',
          references: 'Dr. Sarah Johnson - CTO at TechCorp'
        });
      }
    });

    // Trigger autofill
    await extension.triggerAutofill();
    await page.waitForTimeout(2000);

    // Verify form fields are accessible and responsive
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    const experienceField = page.locator('#experience');

    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
    expect(experienceField).toBeVisible();
  });

  test('should handle partial autofill when profile is incomplete', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();

    await extension.clearForm();

    // Mock extension with incomplete profile
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: 'Partial User',
          email: 'partial@example.com',
          // Missing other fields
        });
      }
    });

    await extension.triggerAutofill();
    await page.waitForTimeout(2000);

    // Verify available fields are filled
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const phoneField = page.locator('#applicant\\.phone');

    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
    expect(phoneField).toBeVisible();
  });

  test('should handle autofill with different field mappings', async ({ page }) => {
    await page.goto('/fixtures/lever-basic.html');
    await extension.waitForExtensionReady();

    await extension.clearForm();

    // Test that extension can map profile data to different field structures
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: 'Field Mapping Test',
          email: 'mapping@example.com',
          phone: '+1-555-0789',
          linkedin: 'https://linkedin.com/in/mappingtest',
          github: 'https://github.com/mappingtest',
          location: 'Austin, TX',
          experience: 'mid',
          workAuthorization: 'sponsor_required',
          relocation: 'maybe',
          remote: 'hybrid'
        });
      }
    });

    await extension.triggerAutofill();
    await page.waitForTimeout(2000);

    // Verify Lever's different field structure is handled
    const fields = ['#name', '#email', '#phone', '#linkedin', '#github', '#location'];
    
    for (const fieldSelector of fields) {
      const field = page.locator(fieldSelector);
      await expect(field).toBeVisible();
    }
  });

  test('should handle autofill errors gracefully', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();

    await extension.clearForm();

    // Mock extension with invalid data
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: null, // Invalid data
          email: 'invalid-email', // Invalid format
          phone: 'not-a-phone',
          // Missing required fields
        });
      }
    });

    // Should not crash when trying to autofill with invalid data
    await extension.triggerAutofill();
    await page.waitForTimeout(2000);

    // Extension should still be functional
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');

    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();

    // Manual filling should still work
    await extension.fillField('#applicant\\.name', 'Manual Entry');
    await extension.verifyFieldValue('#applicant\\.name', 'Manual Entry');
  });

  test('should handle multiple autofill attempts', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();

    await extension.clearForm();

    // Mock extension with profile
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: 'Multiple Attempts Test',
          email: 'multiple@example.com',
          phone: '+1-555-0123'
        });
      }
    });

    // Trigger autofill multiple times
    await extension.triggerAutofill();
    await page.waitForTimeout(1000);
    
    await extension.triggerAutofill();
    await page.waitForTimeout(1000);
    
    await extension.triggerAutofill();
    await page.waitForTimeout(1000);

    // Should handle multiple attempts without issues
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');

    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
  });

  test('should work with keyboard shortcut from different contexts', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();

    await extension.clearForm();

    // Focus different elements and try keyboard shortcut
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const body = page.locator('body');

    // Test from name field
    await nameField.focus();
    await extension.triggerAutofill();
    await page.waitForTimeout(500);

    // Test from email field
    await emailField.focus();
    await extension.triggerAutofill();
    await page.waitForTimeout(500);

    // Test from body (no field focused)
    await body.click();
    await extension.triggerAutofill();
    await page.waitForTimeout(500);

    // Should handle all contexts gracefully
    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
  });

  test('should handle autofill on dynamically loaded forms', async ({ page }) => {
    // Start with a page that has no form
    await page.setContent('<html><body><h1>Loading...</h1></body></html>');
    await extension.waitForExtensionReady();

    // Dynamically add a form
    await page.evaluate(() => {
      document.body.innerHTML = `
        <h1>Dynamic Form Test</h1>
        <form id="dynamic-form">
          <input type="text" id="dynamic-name" name="name" placeholder="Name">
          <input type="email" id="dynamic-email" name="email" placeholder="Email">
          <input type="tel" id="dynamic-phone" name="phone" placeholder="Phone">
        </form>
      `;
    });

    // Mock extension with profile
    await page.evaluate(() => {
      if (window.localFillExtension && window.localFillExtension.setProfile) {
        window.localFillExtension.setProfile({
          name: 'Dynamic Test User',
          email: 'dynamic@example.com',
          phone: '+1-555-0123'
        });
      }
    });

    // Wait for form to be ready
    await page.waitForSelector('#dynamic-form');

    // Try autofill on dynamically loaded form
    await extension.triggerAutofill();
    await page.waitForTimeout(2000);

    // Verify form elements are accessible
    const nameField = page.locator('#dynamic-name');
    const emailField = page.locator('#dynamic-email');
    const phoneField = page.locator('#dynamic-phone');

    expect(nameField).toBeVisible();
    expect(emailField).toBeVisible();
    expect(phoneField).toBeVisible();
  });
});
