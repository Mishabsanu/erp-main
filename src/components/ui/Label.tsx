import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, children, ...props }, ref) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };
