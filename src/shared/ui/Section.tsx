import React from 'react';
import Container from './layout/Container';

interface SectionProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  spacing?: string;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  description, 
  action,
  className = '',
  spacing = 'py-20 md:py-24'
}) => {
  return (
    <section className={`${spacing} ${className}`}>
      <Container>
        {(title || description || action) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2 max-w-3xl">
              {title && (
                <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-zinc-500 text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        <div>
          {children}
        </div>
      </Container>
    </section>
  );
};

export default Section;
