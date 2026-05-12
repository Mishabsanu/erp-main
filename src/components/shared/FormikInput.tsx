import React from 'react';
import { useField } from 'formik';
import { Input, InputProps } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface FormikInputProps extends InputProps {
  label?: string; // ✅ optional
  name: string;
  required?: boolean;
  uppercase?: boolean;
  wrapperClassName?: string;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormikInput: React.FC<FormikInputProps> = ({
  label,
  name,
  required = false,
  uppercase = false,
  suffix,
  icon,
  wrapperClassName,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <Label htmlFor={name} className="mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={name}
          {...field}
          {...props}
          maxLength={props.maxLength}
          onChange={(e) => {
            let processedValue: string | number | undefined = e.target.value;
            if (props.type === 'number') {
              if (processedValue === '') {
                processedValue = undefined; // Treat empty number input as undefined
              } else {
                processedValue = Number(processedValue);
              }
            } else if (uppercase) {
              processedValue = processedValue.toUpperCase();
            }
            helpers.setValue(processedValue);
          }}
          className={`${meta.touched && meta.error ? 'border-red-500' : ''} ${icon ? 'pl-10' : ''}`}
        />
        {suffix && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{suffix}</div>}
      </div>
      {meta.touched && meta.error ? (
        <div className="mt-1 text-xs text-red-600">{meta.error}</div>
      ) : null}
    </div>
  );
};
