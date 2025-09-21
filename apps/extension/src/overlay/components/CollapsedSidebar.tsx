import React from 'react';
import { IconButton } from './IconButton';

interface CollapsedSidebarProps {
  isDarkMode: boolean;
  onTriggerAutofill: () => void;
  onCopyLLMPrompt: () => void;
}

export const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
  isDarkMode,
  onTriggerAutofill,
  onCopyLLMPrompt
}) => {
  const AutofillIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const CopyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center py-3 space-y-3">
      <IconButton
        onClick={onTriggerAutofill}
        icon={<AutofillIcon />}
        isDarkMode={isDarkMode}
        ariaLabel="Auto-fill Form"
        size="md"
      />

      <IconButton
        onClick={onCopyLLMPrompt}
        icon={<CopyIcon />}
        isDarkMode={isDarkMode}
        ariaLabel="Copy LLM Prompt"
        size="md"
      />
    </div>
  );
};
