import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDarkMode?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  isDarkMode = false
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className={`relative w-full ${sizeClasses[size]} rounded-lg shadow-xl`}
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
          }}
        >
          {/* Header */}
          {title && (
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ 
                borderColor: isDarkMode ? '#374151' : '#e5e7eb'
              }}
            >
              <h3 
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="transition-colors"
                style={{
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#d1d5db' : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280';
                }}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
