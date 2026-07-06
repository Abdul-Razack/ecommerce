import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'outline', // 'outline', 'shadow', 'flat'
  padding = 'p-8',
  rounded = 'rounded-2xl',
  hover = false
}) => {
  const variants = {
    outline: 'border border-border-light bg-white',
    shadow: 'border border-border-light bg-white shadow-depth-1',
    flat: 'bg-background'
  };

  return (
    <div className={`
      ${variants[variant]} 
      ${rounded} 
      ${padding} 
      ${hover ? 'hover:shadow-depth-2 hover:border-border-medium transition-all duration-700' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
