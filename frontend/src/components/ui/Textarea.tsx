import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  error,
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  const stateClasses = error
    ? 'border-red-300 focus:border-red-300 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-900'
    : 'border-gray-300 focus:border-theme-primary focus:ring-theme-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-theme-primary-800';

  const classes = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <div className="w-full">
      <textarea
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
