import React, { HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  glass = false, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`card ${glass ? 'glass-panel' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
