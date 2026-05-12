import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all duration-200 hover:border-slate-300 bg-white text-slate-800 placeholder-slate-400 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
