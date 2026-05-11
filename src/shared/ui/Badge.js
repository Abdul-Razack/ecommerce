import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-600',
    success: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
    primary: 'bg-black text-white',
    outline: 'border border-border-light text-zinc-500',
    neutral: 'bg-background text-foreground border border-border-light',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
