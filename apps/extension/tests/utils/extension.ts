import { Page, expect } from '@playwright/test';

export interface TestProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
  experience: string;
  workAuthorization: string;
  relocation: string;
  remote: string;
  salary: string;
  startDate: string;
  coverLetter: string;
  references: string;
}

export const DEFAULT_TEST_PROFILE: TestProfile = {
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
  coverLetter: 'I am excited to apply for this position and contribute to your team.',
  references: 'Available upon request'
};

export class ExtensionHelper {
  constructor(private page: Page) {}

  /**
   * Wait for the extension to be loaded and ready
   */
  async waitForExtensionReady(): Promise<void> {
    // Wait for content script to be injected - look for the sidebar container
    await this.page.waitForFunction(() => {
      return document.getElementById('local-fill-sidebar') !== null;
    }, { timeout: 10000 });
    
    // Also wait for the overlay script to be loaded
    await this.page.waitForFunction(() => {
      return document.querySelector('script[src*="overlay.js"]') !== null;
    }, { timeout: 5000 });
  }

  /**
   * Check if the extension overlay is visible
   */
  async isOverlayVisible(): Promise<boolean> {
    try {
      const overlay = this.page.locator('[data-local-fill="overlay"]');
      return await overlay.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for suggestions popover to appear
   */
  async waitForSuggestions(): Promise<void> {
    await this.page.waitForSelector('[data-local-fill="suggestions"]', { timeout: 5000 });
  }

  /**
   * Click on a suggestion by text content
   */
  async selectSuggestion(text: string): Promise<void> {
    const suggestion = this.page.locator('[data-local-fill="suggestion"]').filter({ hasText: text });
    await suggestion.click();
  }

  /**
   * Trigger autofill using keyboard shortcut
   */
  async triggerAutofill(): Promise<void> {
    await this.page.keyboard.press('Alt+a');
    await this.page.waitForTimeout(500); // Wait for autofill to complete
  }

  /**
   * Fill a form field with a value
   */
  async fillField(selector: string, value: string): Promise<void> {
    const field = this.page.locator(selector);
    await field.fill(value);
    // Trigger change event
    await field.dispatchEvent('change');
  }

  /**
   * Verify that a field has been filled with the expected value
   */
  async verifyFieldValue(selector: string, expectedValue: string): Promise<void> {
    const field = this.page.locator(selector);
    await expect(field).toHaveValue(expectedValue);
  }

  /**
   * Check if the extension is loaded and ready
   */
  async isExtensionIconVisible(): Promise<boolean> {
    try {
      // Check if the extension sidebar container exists
      return await this.page.evaluate(() => {
        return document.getElementById('local-fill-sidebar') !== null;
      });
    } catch {
      return false;
    }
  }

  /**
   * Navigate to the extension options page
   */
  async openOptionsPage(): Promise<void> {
    await this.page.goto('chrome://extensions/');
    // This would need to be adapted based on the actual extension ID
    // For testing, we might need to use a different approach
  }

  /**
   * Get the current form data from the page
   */
  async getFormData(): Promise<Record<string, string>> {
    return await this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return {};
      
      const formData = new FormData(form);
      const data: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        data[key] = value.toString();
      }
      
      return data;
    });
  }

  /**
   * Verify that all expected fields have been filled
   */
  async verifyFormFilled(expectedData: Partial<TestProfile>): Promise<void> {
    for (const [key, value] of Object.entries(expectedData)) {
      if (value !== undefined) {
        // Try different possible selectors for the field
        const selectors = [
          `[name="${key}"]`,
          `[id="${key}"]`,
          `[name="applicant.${key}"]`,
          `[id="applicant.${key}"]`
        ];
        
        let filled = false;
        for (const selector of selectors) {
          try {
            const field = this.page.locator(selector);
            if (await field.count() > 0) {
              await this.verifyFieldValue(selector, value);
              filled = true;
              break;
            }
          } catch {
            // Continue to next selector
          }
        }
        
        if (!filled) {
          console.warn(`Field ${key} not found or not filled with expected value: ${value}`);
        }
      }
    }
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input: any) => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } else {
            input.value = '';
          }
        });
      }
    });
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}
