import React, { useState } from 'react';
import { YearSelector } from '../components/YearSelector';
import { MovieList } from '../components/MovieList';
import { Navigation } from '../components/Navigation';
import { Timeline } from '../components/Timeline';

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(1980);

  return (
    <div className="min-h-screen bg-black text-red-500">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movies Section */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-8 text-shadow-glow">80s Horror Challenge</h1>
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">{selectedYear} Horror Movies</h2>
              <MovieList year={selectedYear} />
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-shadow-glow">Community Feed</h2>
            <Timeline />
          </div>
        </div>
      </div>
    </div>
  );
}