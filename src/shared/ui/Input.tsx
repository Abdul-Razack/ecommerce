import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {label && (
        <label className="text-xs uppercase tracking-[0.15em] text-gray-500 font-black ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-onyx/10 text-sm font-medium focus:border-onyx focus:ring-0 outline-none transition-all duration-300 placeholder:text-onyx/30 rounded-full shadow-sm focus:shadow-md ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-bold ml-1 tracking-tight">{error}</span>}
    </div>
  );
};

export default Input;
