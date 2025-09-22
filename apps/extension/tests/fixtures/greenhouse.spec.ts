import { test, expect } from '@playwright/test';
import { ExtensionHelper } from '../utils/extension';
import { TEST_PROFILES } from '../fixtures/test-profiles';

test.describe('Greenhouse Application Form', () => {
  let extension: ExtensionHelper;

  test.beforeEach(async ({ page }) => {
    extension = new ExtensionHelper(page);
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();
  });

  test('should load Greenhouse form correctly', async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('#applicant\\.name')).toBeVisible();
    await expect(page.locator('#applicant\\.email')).toBeVisible();
    await expect(page.locator('#applicant\\.phone')).toBeVisible();
    await expect(page.locator('#applicant\\.linkedin')).toBeVisible();
    await expect(page.locator('#applicant\\.github')).toBeVisible();
    await expect(page.locator('#applicant\\.location')).toBeVisible();
    await expect(page.locator('#applicant\\.experience')).toBeVisible();
    await expect(page.locator('#applicant\\.cover_letter')).toBeVisible();
  });

  test('should allow manual form filling', async ({ page }) => {
    const profile = TEST_PROFILES.basic;
    
    // Fill form manually
    await extension.fillField('#applicant\\.name', profile.name);
    await extension.fillField('#applicant\\.email', profile.email);
    await extension.fillField('#applicant\\.phone', profile.phone);
    await extension.fillField('#applicant\\.linkedin', profile.linkedin);
    await extension.fillField('#applicant\\.github', profile.github);
    await extension.fillField('#applicant\\.location', profile.location);
    
    // Verify values are set
    await extension.verifyFieldValue('#applicant\\.name', profile.name);
    await extension.verifyFieldValue('#applicant\\.email', profile.email);
    await extension.verifyFieldValue('#applicant\\.phone', profile.phone);
    await extension.verifyFieldValue('#applicant\\.linkedin', profile.linkedin);
    await extension.verifyFieldValue('#applicant\\.github', profile.github);
    await extension.verifyFieldValue('#applicant\\.location', profile.location);
  });

  test('should handle dropdown selections', async ({ page }) => {
    const experienceSelect = page.locator('#applicant\\.experience');
    const workAuthSelect = page.locator('#applicant\\.work_authorization');
    const relocationSelect = page.locator('#applicant\\.relocation');
    const remoteSelect = page.locator('#applicant\\.remote');
    
    // Test experience selection
    await experienceSelect.selectOption('4-5');
    await expect(experienceSelect).toHaveValue('4-5');
    
    // Test work authorization
    await workAuthSelect.selectOption('authorized');
    await expect(workAuthSelect).toHaveValue('authorized');
    
    // Test relocation preference
    await relocationSelect.selectOption('yes');
    await expect(relocationSelect).toHaveValue('yes');
    
    // Test remote work preference
    await remoteSelect.selectOption('hybrid');
    await expect(remoteSelect).toHaveValue('hybrid');
  });

  test('should handle textarea fields', async ({ page }) => {
    const coverLetterField = page.locator('#applicant\\.cover_letter');
    const referencesField = page.locator('#applicant\\.references');
    const additionalInfoField = page.locator('#applicant\\.additional_info');
    
    const coverLetterText = 'I am excited to apply for this position and contribute to your team.';
    const referencesText = 'Available upon request';
    const additionalInfoText = 'I am available for an interview at your convenience.';
    
    await extension.fillField('#applicant\\.cover_letter', coverLetterText);
    await extension.fillField('#applicant\\.references', referencesText);
    await extension.fillField('#applicant\\.additional_info', additionalInfoText);
    
    await extension.verifyFieldValue('#applicant\\.cover_letter', coverLetterText);
    await extension.verifyFieldValue('#applicant\\.references', referencesText);
    await extension.verifyFieldValue('#applicant\\.additional_info', additionalInfoText);
  });

  test('should handle date fields', async ({ page }) => {
    const startDateField = page.locator('#applicant\\.start_date');
    const testDate = '2024-02-01';
    
    await extension.fillField('#applicant\\.start_date', testDate);
    await extension.verifyFieldValue('#applicant\\.start_date', testDate);
  });

  test('should handle file upload field', async ({ page }) => {
    const resumeField = page.locator('#applicant\\.resume');
    
    // Verify file input is present and accepts correct file types
    await expect(resumeField).toBeVisible();
    await expect(resumeField).toHaveAttribute('accept', '.pdf,.doc,.docx');
  });

  test('should validate required fields', async ({ page }) => {
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit without filling required fields
    await submitButton.click();
    
    // Check that required field validation works
    await expect(nameField).toHaveAttribute('required');
    await expect(emailField).toHaveAttribute('required');
  });

  test('should handle form submission', async ({ page }) => {
    // Fill required fields
    await extension.fillField('#applicant\\.name', 'Test User');
    await extension.fillField('#applicant\\.email', 'test@example.com');
    
    // Set up dialog handler for form submission
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Form submitted! (This is a test fixture)');
      await dialog.accept();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
  });

  test('should work with extension autofill simulation', async ({ page }) => {
    // Clear form first
    await extension.clearForm();
    
    // Simulate extension autofill by filling fields programmatically
    const profile = TEST_PROFILES.basic;
    
    // Fill fields as the extension would
    await page.evaluate((profileData) => {
      const fields = {
        'applicant.name': profileData.name,
        'applicant.email': profileData.email,
        'applicant.phone': profileData.phone,
        'applicant.linkedin': profileData.linkedin,
        'applicant.github': profileData.github,
        'applicant.location': profileData.location,
        'applicant.experience': profileData.experience,
        'applicant.work_authorization': profileData.workAuthorization,
        'applicant.relocation': profileData.relocation,
        'applicant.remote': profileData.remote,
        'applicant.salary_expectation': profileData.salary,
        'applicant.start_date': profileData.startDate,
        'applicant.cover_letter': profileData.coverLetter,
        'applicant.references': profileData.references
      };
      
      for (const [selector, value] of Object.entries(fields)) {
        const element = document.querySelector(`#${selector.replace('.', '\\.')}`);
        if (element) {
          (element as HTMLInputElement).value = value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, profile);
    
    // Verify all fields are filled
    await extension.verifyFormFilled(profile);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    const phoneField = page.locator('#applicant\\.phone');
    
    // Focus first field
    await nameField.focus();
    await expect(nameField).toBeFocused();
    
    // Tab to next field
    await page.keyboard.press('Tab');
    await expect(emailField).toBeFocused();
    
    // Tab to next field
    await page.keyboard.press('Tab');
    await expect(phoneField).toBeFocused();
  });
});
