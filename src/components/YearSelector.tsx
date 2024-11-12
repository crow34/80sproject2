import React from 'react';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
  const years = Array.from({ length: 10 }, (_, i) => 1980 + i);

  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
      {years.map(year => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={`px-6 py-2 rounded-full text-lg font-bold transition-colors ${
            selectedYear === year
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-red-500 hover:bg-gray-700'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}