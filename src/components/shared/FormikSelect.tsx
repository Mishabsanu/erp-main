'use client';

import React from 'react';
import { useField } from 'formik';
import { Select, SelectProps } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

interface FormikSelectProps extends SelectProps {
  label?: string;
  name: string;
  options: { value: string | number; label: string }[];
  required?: boolean;
 wrapperClassName?: string; 
}


export const FormikSelect: React.FC<FormikSelectProps> = ({
  label,
  name,
  options,
  required = false,
  wrapperClassName,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div className={wrapperClassName || "mb-4"}>
      {label && (
        <Label htmlFor={name} className="mb-1 block text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Select
        id={name}
        name={name}
        value={field.value || ''}
        onChange={(e) => helpers.setValue(e.target.value)}
        onBlur={() => helpers.setTouched(true)}
        {...props}
        className={`
    h-[42px]              /* 🔥 MATCH INPUT HEIGHT */
    px-3
    ${
      meta.touched && meta.error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : ''
    }
  `}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {meta.touched && meta.error && (
        <div className="mt-1 text-xs text-red-600">{meta.error}</div>
      )}
    </div>
  );
};
