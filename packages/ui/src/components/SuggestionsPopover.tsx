import React, { useState, useEffect, useRef } from 'react';

export interface Suggestion {
  id: string;
  type: 'profile' | 'format' | 'snippet';
  label: string;
  value: string;
  confidence: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SuggestionsPopoverProps {
  isOpen: boolean;
  suggestions: Suggestion[];
  anchorElement: HTMLElement | null;
  onSelect: (suggestion: Suggestion) => void;
  onClose: () => void;
  onShowMore?: () => void;
  className?: string;
}

export const SuggestionsPopover: React.FC<SuggestionsPopoverProps> = ({
  isOpen,
  suggestions,
  anchorElement,
  onSelect,
  onClose,
  onShowMore,
  className = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, suggestions, onSelect, onClose]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Position the popover relative to the anchor element
  useEffect(() => {
    if (!isOpen || !anchorElement || !popoverRef.current) return;

    const anchorRect = anchorElement.getBoundingClientRect();
    const popover = popoverRef.current;
    const popoverRect = popover.getBoundingClientRect();
    
    // Position below the anchor element
    const top = anchorRect.bottom + window.scrollY + 4;
    const left = anchorRect.left + window.scrollX;
    
    // Adjust if popover would go off screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedLeft = left;
    let adjustedTop = top;
    
    // Check horizontal overflow
    if (left + popoverRect.width > viewportWidth) {
      adjustedLeft = viewportWidth - popoverRect.width - 10;
    }
    
    // Check vertical overflow
    if (top + popoverRect.height > viewportHeight + window.scrollY) {
      adjustedTop = anchorRect.top + window.scrollY - popoverRect.height - 4;
    }
    
    popover.style.position = 'absolute';
    popover.style.top = `${adjustedTop}px`;
    popover.style.left = `${adjustedLeft}px`;
    popover.style.zIndex = '10000';
  }, [isOpen, anchorElement]);

  if (!isOpen || suggestions.length === 0) return null;

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'format':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'snippet':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      ref={popoverRef}
      className={`bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm ${className}`}
      role="listbox"
      aria-label="Suggestions"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Suggestions</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close suggestions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-start gap-3 ${
              index === selectedIndex ? 'bg-blue-50' : ''
            } ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}`}
            role="option"
            aria-selected={index === selectedIndex}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getSuggestionIcon(suggestion.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.label}
                </p>
                <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {suggestion.value}
              </p>
              
              {suggestion.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {suggestion.description}
                </p>
              )}
            </div>

            {/* Selection indicator */}
            {index === selectedIndex && (
              <div className="flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      {onShowMore && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onShowMore}
            className="w-full text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
          >
            Show more suggestions...
          </button>
        </div>
      )}

      {/* Keyboard instructions */}
      <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span>↑↓ to navigate</span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
