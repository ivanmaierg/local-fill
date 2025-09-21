import React from 'react';
import { IconButton } from './IconButton';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isDarkMode: boolean;
  onToggleCollapse: () => void;
  onToggleDarkMode: () => void;
  onToggleFullWidth: () => void;
  onClose: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  isDarkMode,
  onToggleCollapse,
  onToggleDarkMode,
  onToggleFullWidth,
  onClose
}) => {
  const SunIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const ExpandIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const CollapseIcon = () => (
    <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );

  const FullWidthIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5M17 7l5-5m0 0v4m0-4h-4M7 17l-5 5m0 0v-4m0 4h4M17 17l5 5m0 0v-4m0 4h-4"
      />
    </svg>
  );

  const ExitFullWidthIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <div
      className={`flex items-center justify-between border-b ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-gray-50'
      }`}
      style={{
        padding: isCollapsed ? '16px 8px' : '16px',
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
        borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb',
      }}
    >
      {!isCollapsed && (
        <h2 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Local-Fill
        </h2>
      )}
      <div className="flex items-center space-x-2">
        {isCollapsed ? (
          <IconButton
            onClick={onToggleCollapse}
            icon={<ExpandIcon />}
            isDarkMode={isDarkMode}
            ariaLabel="Expand sidebar"
          />
        ) : (
          <>
            <IconButton
              onClick={onToggleDarkMode}
              icon={isDarkMode ? <SunIcon /> : <MoonIcon />}
              isDarkMode={isDarkMode}
              ariaLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <IconButton
              onClick={onToggleFullWidth}
              icon={false ? <ExitFullWidthIcon /> : <FullWidthIcon />}
              isDarkMode={isDarkMode}
              ariaLabel={false ? 'Exit full screen' : 'Enter full screen'}
            />
          </>
        )}
        <IconButton
          onClick={onToggleCollapse}
          icon={<CollapseIcon />}
          isDarkMode={isDarkMode}
          ariaLabel={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        <IconButton
          onClick={onClose}
          icon={<CloseIcon />}
          isDarkMode={isDarkMode}
          ariaLabel="Close sidebar"
        />
      </div>
    </div>
  );
};
