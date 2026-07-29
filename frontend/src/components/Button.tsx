import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner"></span>}
      <span className="btn-content">{children}</span>
    </button>
  );
};
