import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {label && (
        <label className="text-xs uppercase tracking-[0.15em] text-gray-500 font-black ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-5 py-5 bg-white border border-border-light text-base font-medium focus:border-black focus:ring-0 outline-none transition-all duration-300 placeholder:text-gray-300 rounded-xl shadow-depth-1 focus:shadow-depth-2 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-bold ml-1 tracking-tight">{error}</span>}
    </div>
  );
};

export default Input;
