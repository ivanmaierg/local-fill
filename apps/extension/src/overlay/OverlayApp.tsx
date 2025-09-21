import React, { useState, useEffect } from 'react';

interface OverlayAppProps {}

export const OverlayApp: React.FC<OverlayAppProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Listen for focus events on form fields
    const handleFieldFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (isFormField(target)) {
        setActiveField(target);
        setIsVisible(true);
        // TODO: Load suggestions for this field
      }
    };

    const handleFieldBlur = () => {
      // Delay hiding to allow for clicking on suggestions
      setTimeout(() => {
        setIsVisible(false);
        setActiveField(null);
      }, 200);
    };

    document.addEventListener('focusin', handleFieldFocus);
    document.addEventListener('focusout', handleFieldBlur);

    return () => {
      document.removeEventListener('focusin', handleFieldFocus);
      document.removeEventListener('focusout', handleFieldBlur);
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

  const getFieldPosition = (field: HTMLElement) => {
    const rect = field.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };

  if (!isVisible || !activeField) {
    return null;
  }

  const position = getFieldPosition(activeField);

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48"
      style={{
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 192)
      }}
    >
      <div className="text-xs text-gray-500 mb-2">Suggestions</div>
      
      {suggestions.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">
          No suggestions available
        </div>
      ) : (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              onClick={() => {
                // TODO: Apply suggestion
                console.log('Apply suggestion:', suggestion);
                setIsVisible(false);
              }}
            >
              {suggestion.value}
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <button
          className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          onClick={() => {
            // TODO: Open snippet library
            console.log('Open snippet library');
          }}
        >
          More snippets...
        </button>
      </div>
    </div>
  );
};
