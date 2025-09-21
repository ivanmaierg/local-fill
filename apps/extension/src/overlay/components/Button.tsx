import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'ghost',
  size = 'md',
  isDarkMode = false,
  className = '',
  ariaLabel,
  title
}) => {
  const baseClasses = 'rounded transition-colors';
  
  const variantClasses = {
    primary: isDarkMode
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: isDarkMode
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: isDarkMode
      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
};
