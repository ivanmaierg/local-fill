# Local-Fill Extension Testing

This directory contains comprehensive Playwright tests for the Local-Fill Chrome extension.

## Test Structure

```
tests/
├── setup/                 # Test setup and utilities
│   └── test-setup.ts     # Global test configuration
├── utils/                 # Test helper utilities
│   └── extension.ts      # Extension-specific test helpers
├── fixtures/              # Test data and fixtures
│   ├── test-profiles.ts  # Sample profile data
│   ├── greenhouse.spec.ts # Greenhouse form tests
│   └── lever.spec.ts     # Lever form tests
├── extension.spec.ts      # Core extension functionality tests
├── autofill.spec.ts      # Autofill feature tests
└── suggestions.spec.ts   # Suggestions feature tests
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the extension:
   ```bash
   pnpm build
   ```

3. Install Playwright browsers:
   ```bash
   pnpm exec playwright install
   ```

### Running All Tests

```bash
# Run all tests
pnpm e2e

# Run tests with UI mode
pnpm e2e:ui

# Run tests in headed mode (see browser)
pnpm e2e --headed

# Run specific test file
pnpm e2e tests/autofill.spec.ts
```

### Running Tests in Development

1. Start the fixtures server:
   ```bash
   pnpm test:fixtures
   ```

2. In another terminal, run tests:
   ```bash
   pnpm e2e
   ```

## Test Categories

### Extension Basic Functionality (`extension.spec.ts`)
- Extension loading and initialization
- Content script injection
- Basic form field interactions
- Error handling

### Autofill Tests (`autofill.spec.ts`)
- Profile-based autofill functionality
- Field mapping across different ATS platforms
- Partial autofill scenarios
- Error handling with invalid data
- Keyboard shortcut functionality

### Suggestions Tests (`suggestions.spec.ts`)
- On-focus suggestion popover
- Keyboard navigation
- Mouse interactions
- Multiple profile suggestions
- Special character handling

### Fixture Tests
- **Greenhouse** (`fixtures/greenhouse.spec.ts`): Tests for Greenhouse-style forms
- **Lever** (`fixtures/lever.spec.ts`): Tests for Lever-style forms

## Test Utilities

### ExtensionHelper Class

The `ExtensionHelper` class provides common functionality for testing:

```typescript
const extension = new ExtensionHelper(page);

// Wait for extension to be ready
await extension.waitForExtensionReady();

// Check if overlay is visible
const isVisible = await extension.isOverlayVisible();

// Fill a form field
await extension.fillField('#name', 'John Doe');

// Verify field value
await extension.verifyFieldValue('#name', 'John Doe');

// Trigger autofill
await extension.triggerAutofill();

// Take screenshot
await extension.takeScreenshot('test-name');
```

### Test Profiles

Pre-defined test profiles are available in `fixtures/test-profiles.ts`:

- `basic`: Standard developer profile
- `senior`: Senior-level developer profile  
- `entry`: Entry-level developer profile

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { ExtensionHelper } from './utils/extension';

test.describe('My Feature', () => {
  let extension: ExtensionHelper;

  test.beforeEach(async ({ page }) => {
    extension = new ExtensionHelper(page);
    await page.goto('/fixtures/greenhouse-basic.html');
    await extension.waitForExtensionReady();
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use descriptive test names**: Test names should clearly describe what is being tested
2. **Setup and teardown**: Use `beforeEach` to set up consistent test state
3. **Wait for extension**: Always call `waitForExtensionReady()` before testing
4. **Handle async operations**: Use appropriate waits and timeouts
5. **Clean up**: Clear forms between tests when needed
6. **Error handling**: Test both success and failure scenarios

### Testing Extension Features

When testing extension features that may not be fully implemented:

```typescript
test('should show suggestions', async ({ page }) => {
  try {
    await extension.waitForSuggestions();
    // Test suggestions functionality
  } catch {
    console.log('Feature may not be fully implemented yet');
  }
});
```

## Debugging Tests

### Running Tests in Debug Mode

```bash
# Run with debug output
DEBUG=pw:api pnpm e2e

# Run specific test in headed mode
pnpm e2e tests/autofill.spec.ts --headed

# Run with slow motion
pnpm e2e --headed --slowmo=100
```

### Screenshots and Videos

Screenshots are automatically taken on test failures and saved to `test-results/screenshots/`.

Videos are recorded for failed tests and saved to `test-results/videos/`.

### Browser Developer Tools

When running tests in headed mode, you can:
1. Open browser developer tools
2. Inspect the extension in action
3. Debug content scripts and background scripts
4. Monitor network requests and console logs

## CI/CD Integration

Tests are automatically run in GitHub Actions on:
- Push to main/develop branches
- Pull requests to main/develop branches

Test results, screenshots, and videos are uploaded as artifacts.

## Troubleshooting

### Common Issues

1. **Extension not loading**: Ensure the extension is built and the path is correct
2. **Tests timing out**: Increase timeout values or add proper waits
3. **Form fields not found**: Check selector accuracy and form structure
4. **Suggestions not appearing**: Feature may not be implemented yet

### Getting Help

1. Check the test output for error messages
2. Review screenshots and videos of failed tests
3. Run tests in headed mode to see what's happening
4. Check the browser console for JavaScript errors

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate error handling for unimplemented features
3. Include both positive and negative test cases
4. Update this README if adding new test utilities or patterns
