import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full border border-slate-200 bg-white px-3 py-2.5 rounded-lg shadow-sm text-slate-800 placeholder-slate-400
          outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
