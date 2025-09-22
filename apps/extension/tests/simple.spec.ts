import { test, expect } from '@playwright/test';

test.describe('Simple Extension Tests', () => {
  test('should load fixture pages correctly', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Verify the page loads
    await expect(page.locator('h1')).toContainText('Software Engineer');
    
    // Verify form fields are present
    await expect(page.locator('#applicant\\.name')).toBeVisible();
    await expect(page.locator('#applicant\\.email')).toBeVisible();
    await expect(page.locator('#applicant\\.phone')).toBeVisible();
  });

  test('should load Lever fixture correctly', async ({ page }) => {
    await page.goto('/fixtures/lever-basic.html');
    
    // Verify the page loads
    await expect(page.locator('h1')).toContainText('Frontend Developer');
    
    // Verify form fields are present
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
  });

  test('should allow manual form filling', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Fill form manually
    await page.fill('#applicant\\.name', 'John Test User');
    await page.fill('#applicant\\.email', 'john@example.com');
    await page.fill('#applicant\\.phone', '+1-555-0123');
    
    // Verify values are set
    await expect(page.locator('#applicant\\.name')).toHaveValue('John Test User');
    await expect(page.locator('#applicant\\.email')).toHaveValue('john@example.com');
    await expect(page.locator('#applicant\\.phone')).toHaveValue('+1-555-0123');
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check that required field validation works
    const nameField = page.locator('#applicant\\.name');
    const emailField = page.locator('#applicant\\.email');
    
    await expect(nameField).toHaveAttribute('required');
    await expect(emailField).toHaveAttribute('required');
  });

  test('should handle dropdown selections', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Test experience selection
    await page.selectOption('#applicant\\.experience', '4-5');
    await expect(page.locator('#applicant\\.experience')).toHaveValue('4-5');
    
    // Test work authorization
    await page.selectOption('#applicant\\.work_authorization', 'authorized');
    await expect(page.locator('#applicant\\.work_authorization')).toHaveValue('authorized');
  });

  test('should handle textarea fields', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    const coverLetterText = 'I am excited to apply for this position.';
    await page.fill('#applicant\\.cover_letter', coverLetterText);
    await expect(page.locator('#applicant\\.cover_letter')).toHaveValue(coverLetterText);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
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

  test('should work with different form structures', async ({ page }) => {
    // Test Greenhouse form
    await page.goto('/fixtures/greenhouse-basic.html');
    await expect(page.locator('#applicant\\.name')).toBeVisible();
    
    // Test Lever form
    await page.goto('/fixtures/lever-basic.html');
    await expect(page.locator('#name')).toBeVisible();
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Fill required fields
    await page.fill('#applicant\\.name', 'Test User');
    await page.fill('#applicant\\.email', 'test@example.com');
    
    // Set up dialog handler for form submission
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Form submitted! (This is a test fixture)');
      await dialog.accept();
    });
    
    // Submit form
    await page.click('button[type="submit"]');
  });

  test('should handle special characters in form fields', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    const specialText = 'José María González';
    await page.fill('#applicant\\.name', specialText);
    await expect(page.locator('#applicant\\.name')).toHaveValue(specialText);
  });

  test('should handle different input types', async ({ page }) => {
    await page.goto('/fixtures/greenhouse-basic.html');
    
    // Test email field
    await page.fill('#applicant\\.email', 'test@example.com');
    await expect(page.locator('#applicant\\.email')).toHaveValue('test@example.com');
    
    // Test phone field
    await page.fill('#applicant\\.phone', '+1-555-0123');
    await expect(page.locator('#applicant\\.phone')).toHaveValue('+1-555-0123');
    
    // Test URL field
    await page.fill('#applicant\\.linkedin', 'https://linkedin.com/in/test');
    await expect(page.locator('#applicant\\.linkedin')).toHaveValue('https://linkedin.com/in/test');
  });
});
