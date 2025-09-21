import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isDarkMode?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  isDarkMode = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `.trim();
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium"
          style={{ color: isDarkMode ? '#f9fafb' : '#374151' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
          borderColor: error 
            ? '#ef4444' 
            : isDarkMode ? '#4b5563' : '#d1d5db',
          color: isDarkMode ? '#f9fafb' : '#111827'
        }}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p 
          className="text-sm"
          style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
