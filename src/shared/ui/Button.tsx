'use client';

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-onyx text-bone hover:bg-black hover:scale-105 hover:shadow-lg',
    secondary: 'bg-neutral-soft text-onyx hover:bg-onyx hover:text-bone hover:scale-105 hover:shadow-lg',
    outline: 'border border-onyx/20 text-onyx hover:bg-onyx hover:text-bone hover:border-onyx hover:scale-105 hover:shadow-lg',
    white: 'bg-bone text-onyx hover:bg-white hover:scale-105 hover:shadow-lg',
    ghost: 'hover:bg-neutral-soft text-onyx/70 hover:text-onyx',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-base font-bold',
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        rounded-full font-black uppercase tracking-[0.2em]
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
