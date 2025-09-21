// Content script for Local-Fill extension
// Handles DOM scanning, autofill execution, and UI overlay

console.log('Local-Fill: Content script loaded');

// Initialize content script
function initializeContentScript() {
  console.log('Local-Fill: Initializing content script');
  
  // Set up message listeners
  setupMessageListeners();
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Inject overlay UI
  injectOverlayUI();
}

function setupMessageListeners() {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Local-Fill: Content script received message', message);
    
    switch (message.type) {
      case 'TRIGGER_AUTOFILL':
        handleTriggerAutofill();
        break;
      case 'SHOW_SUGGESTIONS':
        handleShowSuggestions(message.field);
        break;
      default:
        console.warn('Local-Fill: Unknown message type in content script', message.type);
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Alt+A for autofill (fallback for when command doesn't work)
    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      handleTriggerAutofill();
    }
  });
}

function injectOverlayUI() {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'local-fill-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `;
  
  document.body.appendChild(overlay);
  
  // Load overlay script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('overlay.js');
  script.type = 'module';
  document.head.appendChild(script);
}

async function handleTriggerAutofill() {
  console.log('Local-Fill: Triggering autofill');
  
  try {
    // Get active profile from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
    
    if (!response.success || !response.data.activeProfile) {
      console.warn('Local-Fill: No active profile found');
      return;
    }
    
    // Scan DOM for form fields
    const fields = scanFormFields();
    console.log('Local-Fill: Found fields', fields);
    
    // TODO: Implement field mapping and autofill logic
    // This will be implemented in the core autofill engine
    
  } catch (error) {
    console.error('Local-Fill: Error during autofill', error);
  }
}

function handleShowSuggestions(field: HTMLElement) {
  console.log('Local-Fill: Showing suggestions for field', field);
  
  // TODO: Implement suggestion popover
  // This will be implemented in the suggestions system
}

function scanFormFields(): HTMLElement[] {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'textarea',
    'select'
  ];
  
  const fields: HTMLElement[] = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        fields.push(element);
      }
    });
  });
  
  return fields;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}
