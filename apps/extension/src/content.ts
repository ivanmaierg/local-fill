function initializeContentScript() {
  setupMessageListeners();
  setupKeyboardShortcuts();
  setupFieldFocusListeners();
  setupDynamicContentObserver();
  injectSidebarUI();
}

function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'PING':
        // Respond to background script's readiness check
        sendResponse({ ready: true });
        break;
      case 'TRIGGER_AUTOFILL':
        handleTriggerAutofill();
        break;
      case 'SHOW_SUGGESTIONS':
        handleShowSuggestions(message.field);
        break;
      case 'TOGGLE_SIDEBAR':
        handleToggleSidebar();
        break;
    }
    return true; // Keep the message channel open for async responses
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      handleTriggerAutofill();
    }
  });
}

function injectSidebarUI() {
  const existingContainer = document.getElementById('local-fill-sidebar');
  if (existingContainer) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'local-fill-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 2147483647;
    pointer-events: auto;
    display: block !important;
  `;

  document.body.appendChild(sidebar);

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('overlay.js');
  script.type = 'module';
  document.head.appendChild(script);
}

async function handleTriggerAutofill() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
    
    if (!response || !response.success || !response.data.activeProfile) {
      console.warn('No active profile found for autofill');
      return;
    }
    
    const profile = response.data.activeProfile;
    
    // Use the new autofill system - send message to background script to handle autofill
    const autofillResponse = await chrome.runtime.sendMessage({ 
      type: 'EXECUTE_AUTOFILL',
      payload: { profile, hostname: window.location.hostname }
    });
    
    if (!autofillResponse.success) {
      console.error('Autofill execution failed:', autofillResponse.error);
      return;
    }
    
    const { filledCount, totalFields, mappings, results } = autofillResponse.data;
    console.log(`Autofilled ${filledCount} fields`);
    
    // Notify the sidebar about the autofill completion
    window.dispatchEvent(new CustomEvent('autofill-completed', { 
      detail: { 
        filledCount, 
        totalFields,
        mappings,
        results
      } 
    }));
    
  } catch (error) {
    console.error('Autofill failed:', error);
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Could not establish connection')) {
      console.warn('Background script not available, autofill will be handled by sidebar');
    }
  }
}

// Legacy autofill functions removed - now using the new autofill system from @local-fill/lib

function handleShowSuggestions(field: HTMLElement) {
  // Dispatch event to show suggestions for the specific field
  window.dispatchEvent(new CustomEvent('show-suggestions', { 
    detail: { field } 
  }));
}

function handleToggleSidebar() {
  const sidebar = document.getElementById('local-fill-sidebar');
  if (sidebar) {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }
}

// Legacy scanFormFields function removed - now using DomScanner from @local-fill/lib

// Enhanced field detection for better autofill accuracy
function isFormField(element: HTMLElement): boolean {
  const formFieldSelectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'input[type="password"]',
    'input[type="search"]',
    'textarea',
    'select'
  ];

  return formFieldSelectors.some(selector => element.matches(selector));
}

// Setup field focus listeners for suggestions
function setupFieldFocusListeners() {
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    if (isFormField(target)) {
      handleShowSuggestions(target);
    }
  });

  // Listen for open-options from overlay and open options via chrome runtime
  window.addEventListener('open-options', () => {
    try {
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    } catch (_err) {
      // no-op
    }
  });
}

// Handle dynamic content changes (for SPAs)
function setupDynamicContentObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if new form fields were added
            const newFields = node.querySelectorAll('input, textarea, select');
            if (newFields.length > 0) {
              console.log(`Detected ${newFields.length} new form fields`);
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}