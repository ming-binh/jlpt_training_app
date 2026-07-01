import React, { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <span className="input-icon">{icon}</span>}
          <input 
            ref={ref}
            className={`input-field ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
            {...props} 
          />
        </div>
        {error && <span className="input-error animate-slide-up">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
