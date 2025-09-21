import React from 'react';
import { Button } from './Button';

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  isDarkMode?: boolean;
  ariaLabel?: string;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  isDarkMode = false,
  ariaLabel,
  title,
  className = '',
  size = 'sm'
}) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size={size}
      isDarkMode={isDarkMode}
      className={className}
      ariaLabel={ariaLabel}
      title={title}
    >
      {icon}
    </Button>
  );
};
