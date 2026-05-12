import React from 'react';
import { X } from 'lucide-react';

type FilterChipColor = 'blue' | 'green' | 'purple' | 'red';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: FilterChipColor;
}

export const FilterChip = ({
  label,
  value,
  onRemove,
  color = 'blue',
}: FilterChipProps) => {
  const styles: Record<FilterChipColor, string> = {
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${styles[color]}`}
    >
      {label}: {value}
      <button onClick={onRemove} className="hover:opacity-80">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};
