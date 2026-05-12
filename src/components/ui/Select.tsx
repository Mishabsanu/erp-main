import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={`w-full border border-slate-200 bg-white px-3 py-2.5 rounded-lg shadow-sm text-slate-800
        outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export { Select };
