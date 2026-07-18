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
    primary: 'bg-black text-white hover:bg-zinc-800 hover:scale-105 hover:shadow-lg',
    secondary: 'bg-zinc-100 text-black hover:bg-zinc-200 hover:scale-105 hover:shadow-lg',
    outline: 'border border-black text-black hover:bg-black hover:text-white hover:scale-105 hover:shadow-lg',
    white: 'bg-white text-black hover:bg-zinc-50 hover:scale-105 hover:shadow-lg',
    ghost: 'hover:bg-zinc-100 text-zinc-600 hover:text-black',
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
