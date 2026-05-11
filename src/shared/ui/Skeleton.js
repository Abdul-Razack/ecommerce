import React from 'react';

const Skeleton = ({ className = '', circle = false }) => {
  return (
    <div className={`animate-pulse bg-zinc-100 ${circle ? 'rounded-full' : ''} ${className}`} />
  );
};

export default Skeleton;
