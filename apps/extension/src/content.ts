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
    const fields = scanFormFields();
    
    if (fields.length === 0) {
      console.warn('No form fields found on this page');
      return;
    }

    // Perform autofill
    const filledFields = await performAutofill(fields, profile);
    console.log(`Autofilled ${filledFields} fields`);
    
    // Notify the sidebar about the autofill completion
    window.dispatchEvent(new CustomEvent('autofill-completed', { 
      detail: { filledCount: filledFields, totalFields: fields.length } 
    }));
    
  } catch (error) {
    console.error('Autofill failed:', error);
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('Could not establish connection')) {
      console.warn('Background script not available, autofill will be handled by sidebar');
    }
  }
}

async function performAutofill(fields: HTMLElement[], profile: any): Promise<number> {
  let filledCount = 0;

  for (const field of fields) {
    try {
      const fieldValue = getFieldValue(field, profile);
      if (fieldValue) {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          field.value = fieldValue;
          
          // Dispatch events to trigger any form validation
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('blur', { bubbles: true }));
          
          filledCount++;
        } else if (field instanceof HTMLSelectElement) {
          // For select elements, try to find matching option
          const option = Array.from(field.options).find(opt => 
            opt.value.toLowerCase().includes(fieldValue.toLowerCase()) ||
            opt.text.toLowerCase().includes(fieldValue.toLowerCase())
          );
          if (option) {
            field.value = option.value;
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fill field:', field, error);
    }
  }

  return filledCount;
}

function getFieldValue(field: HTMLElement, profile: any): string | null {
  const fieldName = field.getAttribute('name')?.toLowerCase() || '';
  const fieldType = field.getAttribute('type')?.toLowerCase() || '';
  const fieldId = field.getAttribute('id')?.toLowerCase() || '';
  const fieldPlaceholder = field.getAttribute('placeholder')?.toLowerCase() || '';

  // Email field
  if (fieldType === 'email' || fieldName.includes('email') || fieldId.includes('email') || fieldPlaceholder.includes('email')) {
    return profile.email || null;
  }

  // First name
  if (fieldName.includes('first') || fieldId.includes('first') || fieldPlaceholder.includes('first')) {
    return profile.firstName || null;
  }

  // Last name
  if (fieldName.includes('last') || fieldId.includes('last') || fieldPlaceholder.includes('last')) {
    return profile.lastName || null;
  }

  // Full name
  if (fieldName.includes('name') || fieldId.includes('name') || fieldPlaceholder.includes('name')) {
    return profile.fullName || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : null);
  }

  // Phone
  if (fieldType === 'tel' || fieldName.includes('phone') || fieldId.includes('phone') || fieldPlaceholder.includes('phone')) {
    return profile.phone || null;
  }

  // LinkedIn
  if (fieldName.includes('linkedin') || fieldId.includes('linkedin') || fieldPlaceholder.includes('linkedin')) {
    return profile.linkedin || null;
  }

  // GitHub
  if (fieldName.includes('github') || fieldId.includes('github') || fieldPlaceholder.includes('github')) {
    return profile.github || null;
  }

  // Portfolio/Website
  if (fieldType === 'url' || fieldName.includes('website') || fieldName.includes('portfolio') || fieldId.includes('website') || fieldId.includes('portfolio')) {
    return profile.portfolio || profile.website || null;
  }

  // Location
  if (fieldName.includes('location') || fieldName.includes('city') || fieldId.includes('location') || fieldId.includes('city')) {
    return profile.location || profile.city || null;
  }

  // Company
  if (fieldName.includes('company') || fieldId.includes('company') || fieldPlaceholder.includes('company')) {
    return profile.currentCompany || profile.company || null;
  }

  // Title/Position
  if (fieldName.includes('title') || fieldName.includes('position') || fieldId.includes('title') || fieldId.includes('position')) {
    return profile.currentTitle || profile.title || null;
  }

  return null;
}

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

function scanFormFields(): HTMLElement[] {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'input[type="password"]',
    'input[type="search"]',
    'textarea',
    'select'
  ];
  
  const fields: HTMLElement[] = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement && element.offsetParent !== null) {
        // Only include visible fields
        fields.push(element);
      }
    });
  });
  
  return fields;
}

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