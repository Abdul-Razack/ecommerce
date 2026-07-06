'use client';

import React, { useState } from 'react';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black group-hover:text-zinc-500 transition-colors">
          {title}
        </span>
        <span className={`text-xl font-light transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          +
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
