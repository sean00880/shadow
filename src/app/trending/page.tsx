// src/app/dashboard/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import TrendingTable from '../../components/TrendingTable';
import SidebarAd from '../../components/SideBarAd';
import TrendingBar from '../../components/TrendingBar';

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Example of handling dark mode dynamically if needed
  useEffect(() => {
    // Assume there's a global way to check dark mode preference, e.g., local storage or context
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
  }, []);

  return (
    <div className={`dashboard min-h-screen ${isDarkMode ? 'bg-dark-background text-white' : 'bg-light-background text-gray-800'} font-sans`}>
      <TrendingBar isDarkMode={isDarkMode} />
      <div className="flex w-full">
        {/* Left Ad Sidebar */}
        <SidebarAd position="left" />

        {/* Center Content - Trending Table */}
        <div className="flex-grow mx-2">
          <TrendingTable isDarkMode={isDarkMode} />
        </div>

        {/* Right Ad Sidebar */}
        <SidebarAd position="right" />
      </div>
    </div>
  );
}
