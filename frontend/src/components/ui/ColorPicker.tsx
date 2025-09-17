import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const presetColors = [
  '#1e40af', // blue-800
  '#1d4ed8', // blue-700
  '#2563eb', // blue-600
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#0891b2', // cyan-600
  '#06b6d4', // cyan-500
  '#22c55e', // green-500
  '#16a34a', // green-600
  '#84cc16', // lime-500
  '#ca8a04', // yellow-600
  '#eab308', // yellow-500
  '#f59e0b', // amber-500
  '#d97706', // amber-600
  '#ea580c', // orange-600
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#dc2626', // red-600
  '#ec4899', // pink-500
  '#db2777', // pink-600
  '#a855f7', // purple-500
  '#9333ea', // purple-600
  '#6366f1', // indigo-500
  '#4f46e5', // indigo-600
  '#000000', // black
  '#ffffff', // white
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label = 'Couleur',
  className = '',
}) => {
  const [currentColor, setCurrentColor] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);
  };

  const handlePresetClick = (presetColor: string) => {
    setCurrentColor(presetColor);
    onChange(presetColor);
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
              style={{ backgroundColor: currentColor }}
              aria-label="Choisir une couleur"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={handleColorChange}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => {
                    setCurrentColor(e.target.value);
                    onChange(e.target.value);
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="grid grid-cols-8 gap-1">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetClick(presetColor)}
                    aria-label={`Couleur ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={currentColor}
          onChange={(e) => {
            setCurrentColor(e.target.value);
            onChange(e.target.value);
          }}
          className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-200"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};
