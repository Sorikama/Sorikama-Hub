import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  icon,
  className = ''
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="relative flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded cursor-pointer"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-900 dark:text-white flex items-center cursor-pointer">
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </label>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
