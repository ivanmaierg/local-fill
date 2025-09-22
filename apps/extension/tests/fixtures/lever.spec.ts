import { test, expect } from '@playwright/test';
import { ExtensionHelper } from '../utils/extension';
import { TEST_PROFILES } from '../fixtures/test-profiles';

test.describe('Lever Application Form', () => {
  let extension: ExtensionHelper;

  test.beforeEach(async ({ page }) => {
    extension = new ExtensionHelper(page);
    await page.goto('/fixtures/lever-basic.html');
    await extension.waitForExtensionReady();
  });

  test('should load Lever form correctly', async ({ page }) => {
    // Verify form elements are present (Lever uses different field naming)
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#linkedin')).toBeVisible();
    await expect(page.locator('#github')).toBeVisible();
    await expect(page.locator('#location')).toBeVisible();
    await expect(page.locator('#experience')).toBeVisible();
    await expect(page.locator('#cover_letter')).toBeVisible();
  });

  test('should allow manual form filling', async ({ page }) => {
    const profile = TEST_PROFILES.senior;
    
    // Fill form manually using Lever's field structure
    await extension.fillField('#name', profile.name);
    await extension.fillField('#email', profile.email);
    await extension.fillField('#phone', profile.phone);
    await extension.fillField('#linkedin', profile.linkedin);
    await extension.fillField('#github', profile.github);
    await extension.fillField('#location', profile.location);
    
    // Verify values are set
    await extension.verifyFieldValue('#name', profile.name);
    await extension.verifyFieldValue('#email', profile.email);
    await extension.verifyFieldValue('#phone', profile.phone);
    await extension.verifyFieldValue('#linkedin', profile.linkedin);
    await extension.verifyFieldValue('#github', profile.github);
    await extension.verifyFieldValue('#location', profile.location);
  });

  test('should handle Lever-specific dropdown options', async ({ page }) => {
    const experienceSelect = page.locator('#experience');
    const workAuthSelect = page.locator('#work_authorization');
    const relocationSelect = page.locator('#relocation');
    const remoteSelect = page.locator('#remote');
    
    // Test experience selection (Lever has different options)
    await experienceSelect.selectOption('senior');
    await expect(experienceSelect).toHaveValue('senior');
    
    // Test work authorization
    await workAuthSelect.selectOption('authorized');
    await expect(workAuthSelect).toHaveValue('authorized');
    
    // Test relocation preference
    await relocationSelect.selectOption('yes');
    await expect(relocationSelect).toHaveValue('yes');
    
    // Test remote work preference
    await remoteSelect.selectOption('full_remote');
    await expect(remoteSelect).toHaveValue('full_remote');
  });

  test('should handle textarea fields', async ({ page }) => {
    const coverLetterField = page.locator('#cover_letter');
    const referencesField = page.locator('#references');
    const additionalInfoField = page.locator('#additional_info');
    
    const coverLetterText = 'With over 8 years of experience, I am excited to bring my expertise to your team.';
    const referencesText = 'Dr. Sarah Johnson - CTO at TechCorp, John Wilson - Senior Engineer at StartupXYZ';
    const additionalInfoText = 'I am particularly interested in your innovative approach to product development.';
    
    await extension.fillField('#cover_letter', coverLetterText);
    await extension.fillField('#references', referencesText);
    await extension.fillField('#additional_info', additionalInfoText);
    
    await extension.verifyFieldValue('#cover_letter', coverLetterText);
    await extension.verifyFieldValue('#references', referencesText);
    await extension.verifyFieldValue('#additional_info', additionalInfoText);
  });

  test('should handle date fields', async ({ page }) => {
    const startDateField = page.locator('#start_date');
    const testDate = '2024-03-01';
    
    await extension.fillField('#start_date', testDate);
    await extension.verifyFieldValue('#start_date', testDate);
  });

  test('should validate required fields', async ({ page }) => {
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit without filling required fields
    await submitButton.click();
    
    // Check that required field validation works
    await expect(nameField).toHaveAttribute('required');
    await expect(emailField).toHaveAttribute('required');
  });

  test('should handle form submission', async ({ page }) => {
    // Fill required fields
    await extension.fillField('#name', 'Jane Smith');
    await extension.fillField('#email', 'jane@example.com');
    
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
    const profile = TEST_PROFILES.senior;
    
    // Fill fields as the extension would (using Lever's field structure)
    await page.evaluate((profileData) => {
      const fields = {
        'name': profileData.name,
        'email': profileData.email,
        'phone': profileData.phone,
        'linkedin': profileData.linkedin,
        'github': profileData.github,
        'location': profileData.location,
        'experience': 'senior', // Map to Lever's experience levels
        'work_authorization': profileData.workAuthorization,
        'relocation': profileData.relocation,
        'remote': profileData.remote,
        'salary': profileData.salary,
        'start_date': profileData.startDate,
        'cover_letter': profileData.coverLetter,
        'references': profileData.references
      };
      
      for (const [selector, value] of Object.entries(fields)) {
        const element = document.querySelector(`#${selector}`);
        if (element) {
          (element as HTMLInputElement).value = value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, profile);
    
    // Verify key fields are filled
    await extension.verifyFieldValue('#name', profile.name);
    await extension.verifyFieldValue('#email', profile.email);
    await extension.verifyFieldValue('#phone', profile.phone);
    await extension.verifyFieldValue('#linkedin', profile.linkedin);
    await extension.verifyFieldValue('#github', profile.github);
    await extension.verifyFieldValue('#location', profile.location);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    const phoneField = page.locator('#phone');
    
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

  test('should handle different experience levels', async ({ page }) => {
    const experienceSelect = page.locator('#experience');
    
    // Test all experience options
    const options = ['entry', 'mid', 'senior'];
    
    for (const option of options) {
      await experienceSelect.selectOption(option);
      await expect(experienceSelect).toHaveValue(option);
    }
  });

  test('should handle salary field with various formats', async ({ page }) => {
    const salaryField = page.locator('#salary');
    
    const salaryFormats = [
      '$80,000 - $100,000',
      '80k-100k',
      '80000-100000',
      '$90,000+'
    ];
    
    for (const salary of salaryFormats) {
      await extension.fillField('#salary', salary);
      await extension.verifyFieldValue('#salary', salary);
    }
  });
});
