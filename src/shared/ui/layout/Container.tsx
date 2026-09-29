import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  clean?: boolean;
  size?: 'normal' | 'wide' | 'full';
}

const Container = ({ children, className = '', clean = false, size = 'wide' }: ContainerProps) => {
  const maxWidthClass =
    size === 'full'
      ? 'max-w-full'
      : size === 'normal'
      ? 'max-w-7xl'
      : 'max-w-[1440px] 2xl:max-w-[1480px]';

  return (
    <div
      suppressHydrationWarning
      className={`${maxWidthClass} mx-auto ${clean ? '' : 'px-4 sm:px-6 md:px-8 lg:px-10'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
