'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface LabeledInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value = '',
  placeholder,
  readOnly = false,
}) => {
  return (
    <div className="mb-4">
      <Label className="mb-1 block">
        {label}
      </Label>

      <Input
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        className={`${
          readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
};
