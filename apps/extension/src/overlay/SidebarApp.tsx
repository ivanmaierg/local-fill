import React, { useState, useEffect } from 'react';
import { SidebarHeader, SidebarContent, CollapsedSidebar, SnippetLibrary } from './components';
import { ProfileManager } from 'lib';

interface SidebarAppProps {}

export const SidebarApp: React.FC<SidebarAppProps> = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<HTMLElement | null>(null);
  const [profileManager] = useState(() => new ProfileManager());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSnippetLibraryOpen, setIsSnippetLibraryOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      const container = document.getElementById('local-fill-sidebar');
      if (container) {
        container.style.display = 'block';
        if (prefersDark) {
          container.classList.add('dark-mode');
        } else {
          container.classList.remove('dark-mode');
        }
      }
    };

    const handleFieldFocus = async (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (isFormField(target)) {
        setActiveField(target);
        setIsVisible(true);
        
        // Load suggestions for the focused field
        await loadSuggestionsForField(target);
      }
    };

    const loadSuggestionsForField = async (field: HTMLElement) => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
        
        if (!response.success || !response.data.activeProfile) {
          setSuggestions([]);
          return;
        }

        const profile = response.data.activeProfile;
        const fieldSuggestions = generateSuggestionsForField(field, profile);
        setSuggestions(fieldSuggestions);
      } catch (error) {
        setSuggestions([]);
      }
    };

    const generateSuggestionsForField = (field: HTMLElement, profile: any) => {
      const suggestions: any[] = [];
      const fieldName = field.getAttribute('name')?.toLowerCase() || '';
      const fieldType = field.getAttribute('type')?.toLowerCase() || '';
      const fieldId = field.getAttribute('id')?.toLowerCase() || '';

      // Email field suggestions
      if (fieldType === 'email' || fieldName.includes('email') || fieldId.includes('email')) {
        if (profile.email) {
          suggestions.push({
            value: profile.email,
            description: 'Email address',
            type: 'email'
          });
        }
      }

      // Name field suggestions
      if (fieldName.includes('name') || fieldId.includes('name') || fieldName.includes('first') || fieldName.includes('last')) {
        if (profile.firstName) {
          suggestions.push({
            value: profile.firstName,
            description: 'First name',
            type: 'name'
          });
        }
        if (profile.lastName) {
          suggestions.push({
            value: profile.lastName,
            description: 'Last name',
            type: 'name'
          });
        }
        if (profile.fullName) {
          suggestions.push({
            value: profile.fullName,
            description: 'Full name',
            type: 'name'
          });
        }
      }

      // Phone field suggestions
      if (fieldType === 'tel' || fieldName.includes('phone') || fieldId.includes('phone')) {
        if (profile.phone) {
          suggestions.push({
            value: profile.phone,
            description: 'Phone number',
            type: 'phone'
          });
        }
      }

      // URL field suggestions
      if (fieldType === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('linkedin')) {
        if (profile.linkedin) {
          suggestions.push({
            value: profile.linkedin,
            description: 'LinkedIn profile',
            type: 'url'
          });
        }
        if (profile.github) {
          suggestions.push({
            value: profile.github,
            description: 'GitHub profile',
            type: 'url'
          });
        }
        if (profile.portfolio) {
          suggestions.push({
            value: profile.portfolio,
            description: 'Portfolio website',
            type: 'url'
          });
        }
      }

      return suggestions.slice(0, 3); // Limit to top 3 suggestions
    };

    const handleFieldBlur = () => {
      setTimeout(() => {
        setActiveField(null);
      }, 200);
    };

    const toggleSidebarVisibility = (prevVisibility: boolean) => {
      const newVisibility = !prevVisibility;
      setIsVisible(newVisibility);
      const container = document.getElementById('local-fill-sidebar');
      if (container) {
        container.style.display = newVisibility ? 'block' : 'none';
      }
      return newVisibility;
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TOGGLE_SIDEBAR') {
        setIsVisible(toggleSidebarVisibility);
      }
    };

    const handleToggleEvent = () => {
      setIsVisible(toggleSidebarVisibility);
    };

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    checkDarkMode();

    // Initial profile check (only if Chrome API is available in this context)
    const canUseChrome = typeof (window as any).chrome !== 'undefined' &&
      (window as any).chrome?.runtime?.sendMessage;
    if (canUseChrome) {
      (window as any).chrome.runtime
        .sendMessage({ type: 'GET_ACTIVE_PROFILE' })
        .then((response: any) => {
          if (response && response.success) {
            setHasProfile(Boolean(response.data?.activeProfile) || (response.data?.profiles || []).length > 0);
          }
        })
        .catch(() => {
          // ignore; sidebar still usable without background response
        });
    } else {
      setHasProfile(false);
    }

    document.addEventListener('focusin', handleFieldFocus);
    document.addEventListener('focusout', handleFieldBlur);
    window.addEventListener('message', handleMessage);
    window.addEventListener('toggle-sidebar', handleToggleEvent);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      document.removeEventListener('focusin', handleFieldFocus);
      document.removeEventListener('focusout', handleFieldBlur);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('toggle-sidebar', handleToggleEvent);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  const isFormField = (element: HTMLElement): boolean => {
    const formFieldSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'textarea',
      'select'
    ];

    return formFieldSelectors.some(selector => element.matches(selector));
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    setIsFullWidth(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    const container = document.getElementById('local-fill-sidebar');
    if (container) {
      container.style.display = 'none';
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newDarkMode = !prev;
      const container = document.getElementById('local-fill-sidebar');
      if (container) {
        if (newDarkMode) {
          container.classList.add('dark-mode');
        } else {
          container.classList.remove('dark-mode');
        }
      }
      return newDarkMode;
    });
  };

  const handleToggleFullWidth = () => {
    setIsFullWidth(prev => !prev);
    setIsCollapsed(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTriggerAutofill = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' });
      
      if (!response.success || !response.data.activeProfile) {
        showToast('No active profile found. Please set up a profile first.', 'error');
        return;
      }

      const profile = response.data.activeProfile;
      const fields = scanFormFields();
      if (fields.length === 0) {
        showToast('No form fields found on this page.', 'error');
        return;
      }

      // Perform autofill
      const filledFields = await performAutofill(fields, profile);
      
      if (filledFields > 0) {
        showToast(`Successfully filled ${filledFields} fields!`, 'success');
      } else {
        showToast('No fields could be automatically filled.', 'error');
      }
    } catch (error) {
      showToast('Failed to trigger autofill. Please try again.', 'error');
    }
  };

  const performAutofill = async (fields: HTMLElement[], profile: any): Promise<number> => {
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
  };

  const getFieldValue = (field: HTMLElement, profile: any): string | null => {
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
      return profile.fullName || profile.firstName + ' ' + profile.lastName || null;
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
  };

  const handleOpenSnippetLibrary = () => {
    setIsSnippetLibraryOpen(true);
  };

  const handleCloseSnippetLibrary = () => {
    setIsSnippetLibraryOpen(false);
  };

  const handleApplySnippet = (snippet: any) => {
    if (!activeField) {
      showToast('No active field to apply snippet to', 'error');
      return;
    }

    try {
      if (activeField instanceof HTMLInputElement || activeField instanceof HTMLTextAreaElement) {
        activeField.value = snippet.content;
        
        // Dispatch events to trigger any form validation
        activeField.dispatchEvent(new Event('input', { bubbles: true }));
        activeField.dispatchEvent(new Event('change', { bubbles: true }));
        activeField.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      showToast(`Applied snippet: ${snippet.name}`, 'success');
    } catch (error) {
      showToast('Failed to apply snippet', 'error');
    }
  };

  const handleCopyLLMPrompt = async () => {
    try {
      const result = await profileManager.copyLLMPromptToClipboard();
      if (result.success) {
        showToast('LLM prompt copied to clipboard!', 'success');
      } else {
        showToast(result.error || 'Failed to copy prompt', 'error');
      }
    } catch (error) {
      showToast('Failed to copy LLM prompt. Please try again.', 'error');
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    if (!activeField) return;

    try {
      // Set the value on the field
      if (activeField instanceof HTMLInputElement || activeField instanceof HTMLTextAreaElement) {
        activeField.value = suggestion.value;
        
        // Dispatch events to trigger any form validation
        activeField.dispatchEvent(new Event('input', { bubbles: true }));
        activeField.dispatchEvent(new Event('change', { bubbles: true }));
        activeField.dispatchEvent(new Event('blur', { bubbles: true }));
      } else if (activeField instanceof HTMLSelectElement) {
        // For select elements, try to find matching option
        const option = Array.from(activeField.options).find(opt => 
          opt.value.toLowerCase().includes(suggestion.value.toLowerCase()) ||
          opt.text.toLowerCase().includes(suggestion.value.toLowerCase())
        );
        if (option) {
          activeField.value = option.value;
          activeField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      showToast(`Applied: ${suggestion.description}`, 'success');
    } catch (error) {
      showToast('Failed to apply suggestion', 'error');
    }
  };

  const handleOpenSettings = () => {
    // Ask the content script to open the options page (has access to chrome.runtime)
    window.dispatchEvent(new CustomEvent('open-options'));
  };

  const scanFormFields = (): HTMLElement[] => {
    const formFieldSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="password"]',
      'textarea',
      'select'
    ];

    const fields: HTMLElement[] = [];
    formFieldSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement && element.offsetParent !== null) {
          fields.push(element);
        }
      });
    });

    return fields;
  };

  const widthClass = isFullWidth ? 'w-full' : (isCollapsed ? 'w-10' : 'w-80');

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          style={{ 
            maxWidth: '600px',
            minWidth: '400px',
            width: 'auto',
            right: '16px',
            left: 'auto'
          }}
        >
          {toast.message}
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full border-l shadow-lg z-50 transition-all duration-300 ease-in-out ${widthClass}`}
        style={{
          backgroundColor: isDarkMode ? '#111827' : 'white',
          borderLeftColor: isDarkMode ? '#374151' : '#e5e7eb',
          display: isVisible ? 'block' : 'none',
        }}
      >
      <SidebarHeader
        isCollapsed={isCollapsed}
        isDarkMode={isDarkMode}
        onToggleCollapse={handleToggleCollapse}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleFullWidth={handleToggleFullWidth}
        onClose={handleClose}
      />

      {!isCollapsed && (
        <SidebarContent
          isDarkMode={isDarkMode}
          activeField={activeField}
          suggestions={suggestions}
          onTriggerAutofill={handleTriggerAutofill}
          onOpenSnippetLibrary={handleOpenSnippetLibrary}
          onCopyLLMPrompt={handleCopyLLMPrompt}
          onOpenSettings={handleOpenSettings}
          hasProfile={hasProfile}
          onApplySuggestion={handleApplySuggestion}
        />
      )}

      {isCollapsed && (
        <CollapsedSidebar
          isDarkMode={isDarkMode}
          onTriggerAutofill={handleTriggerAutofill}
          onCopyLLMPrompt={handleCopyLLMPrompt}
        />
      )}
      </div>

      {/* Snippet Library Modal */}
      <SnippetLibrary
        isDarkMode={isDarkMode}
        isVisible={isSnippetLibraryOpen}
        onClose={handleCloseSnippetLibrary}
        onApplySnippet={handleApplySnippet}
      />
    </>
  );
};