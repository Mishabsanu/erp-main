import React from 'react';
import { useField } from 'formik';
import { Textarea, TextareaProps } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

interface FormikTextareaProps extends TextareaProps {
  label?: string;
  name: string;
  required?: boolean;
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

export const FormikTextarea: React.FC<FormikTextareaProps> = ({
  label,
  name,
  required = false,
  wrapperClassName,
  icon,
  ...props
}) => {
  const [field, meta] = useField(name);

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <Label htmlFor={name} className="mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <Textarea
          id={name}
          {...field}
          {...props}
          className={`${meta.touched && meta.error ? 'border-red-500' : ''} ${icon ? 'pl-10' : ''}`}
        />
      </div>
      {meta.touched && meta.error ? (
        <div className="mt-1 text-xs text-red-600">{meta.error}</div>
      ) : null}
    </div>
  );
};
