import React from 'react';
import { Button } from './Button';

interface SidebarContentProps {
  isDarkMode: boolean;
  activeField: HTMLElement | null;
  suggestions: any[];
  onTriggerAutofill: () => void;
  onOpenSnippetLibrary: () => void;
  onCopyLLMPrompt: () => void;
  onApplySuggestion?: (suggestion: any) => void;
  onOpenSettings?: () => void;
  hasProfile?: boolean;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  isDarkMode,
  activeField,
  suggestions,
  onTriggerAutofill,
  onOpenSnippetLibrary,
  onCopyLLMPrompt,
  onApplySuggestion,
  onOpenSettings,
  hasProfile = true
}) => {
  const SnippetIcon = () => (
    <svg className={`w-4 h-4 mr-2 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const AutofillIcon = () => (
    <svg className={`w-4 h-4 mr-2 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const CopyIcon = () => (
    <svg className={`w-4 h-4 mr-2 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {!hasProfile && (
        <div className={`mb-4 p-3 border rounded-lg ${
          isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-yellow-100' : 'text-yellow-900'
              }`}>
                Set up your profile
              </h3>
              <p className={`text-xs ${
                isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
              }`}>
                Create or import a profile to enable autofill and suggestions.
              </p>
            </div>
            {onOpenSettings && (
              <Button
                onClick={onOpenSettings}
                variant={isDarkMode ? 'secondary' : 'primary'}
                size="sm"
                isDarkMode={isDarkMode}
              >
                Open Settings
              </Button>
            )}
          </div>
        </div>
      )}
      {activeField && (
        <div className={`mb-4 p-3 border rounded-lg ${
          isDarkMode
            ? 'bg-blue-900/20 border-blue-800'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`text-sm font-medium mb-1 ${
            isDarkMode ? 'text-blue-100' : 'text-blue-900'
          }`}>Active Field</h3>
          <p className={`text-xs ${
            isDarkMode ? 'text-blue-200' : 'text-blue-700'
          }`}>
            {activeField.tagName.toLowerCase()}
            {activeField.getAttribute('type') && ` (${activeField.getAttribute('type')})`}
            {activeField.getAttribute('name') && ` - ${activeField.getAttribute('name')}`}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-sm font-medium mb-3 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Suggestions</h3>

        {suggestions.length === 0 ? (
          <div className={`text-sm py-4 text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No suggestions available
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`w-full text-left p-3 text-sm border rounded-lg hover:border-gray-300 transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (onApplySuggestion) {
                    onApplySuggestion(suggestion);
                  }
                }}
              >
                <div className={`font-medium ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>{suggestion.value}</div>
                {suggestion.description && (
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{suggestion.description}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className={`text-sm font-medium mb-3 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Quick Actions</h3>

        {onOpenSettings && (
          <Button
            onClick={onOpenSettings}
            variant="secondary"
            size="lg"
            isDarkMode={isDarkMode}
            className="w-full text-left justify-start"
          >
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35.638-.155 1.138-.655 1.293-1.293.426-1.756 2.924-1.756 3.35 0 .155.638.655 1.138 1.293 1.293z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                Open Settings
              </span>
            </div>
          </Button>
        )}

        <Button
          onClick={onOpenSnippetLibrary}
          variant="secondary"
          size="lg"
          isDarkMode={isDarkMode}
          className="w-full text-left justify-start"
        >
          <div className="flex items-center">
            <SnippetIcon />
            <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
              Snippet Library
            </span>
          </div>
        </Button>

        <Button
          onClick={onTriggerAutofill}
          variant="secondary"
          size="lg"
          isDarkMode={isDarkMode}
          className="w-full text-left justify-start"
        >
          <div className="flex items-center">
            <AutofillIcon />
            <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
              Auto-fill Form
            </span>
          </div>
        </Button>

        <Button
          onClick={onCopyLLMPrompt}
          variant="secondary"
          size="lg"
          isDarkMode={isDarkMode}
          className="w-full text-left justify-start"
        >
          <div className="flex items-center">
            <CopyIcon />
            <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
              Copy LLM Prompt
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
};
