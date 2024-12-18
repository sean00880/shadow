"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuthContext } from "../context/AuthContext";

type TopBarProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSidebarOpen: boolean; // New prop to determine sidebar state
};

export default function TopBar({ isDarkMode, toggleTheme, isSidebarOpen  }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { walletAddress, logout, activeProfile } = useAuthContext();

  const profileImage = activeProfile?.profile_image_url || "/images/default_logo.jpg";

  const handleProfileHover = () => setIsMenuOpen(true);
  const handleProfileLeave = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
<div
      className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 py-3 backdrop-blur-lg bg-opacity-70 transition-all duration-500 shadow-lg ${
        isDarkMode
          ? "bg-black/40 text-white border-b border-gray-700"
          : "bg-white/40 text-black border-b border-gray-300"
      } ${isSidebarOpen ? "pl-64" : "pl-16"} transition-all duration-300`} 
    >
      {/* Search Bar with Glassmorphism */}
      <div className="ml-4 w-1/3 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className={`w-full px-4 py-2 rounded-lg bg-opacity-50 backdrop-blur-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-md ${
            isDarkMode ? "bg-gray-900/50 text-white" : "bg-gray-100/50 text-black"
          }`}
        />
        {/* Subtle search icon */}
        <div
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          🔍
        </div>
      </div>

      {/* Logo Section */}
      <div className="flex-1 flex justify-center items-center">
        <Image
          src={isDarkMode ? "/images/LOGODARK.png" : "/images/LogoLIGHT.png"}
          alt="Logo"
          width={200}
          height={40}
          className="cursor-pointer transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Profile and Theme Toggle */}
      <div className="w-1/3 flex justify-end items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full backdrop-blur-lg bg-opacity-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 shadow-md"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {/* Profile Section */}
        {activeProfile ? (
          <div
            ref={menuRef}
            className="relative flex flex-row"
            onMouseEnter={handleProfileHover}
            onMouseLeave={handleProfileLeave}
          >
              <w3m-button />
            <Image
              src={profileImage}
              alt="Profile Image"
              width={40}
              height={40}
              className="rounded-full cursor-pointer border border-gray-300 transition-transform duration-300 hover:scale-110"
            />

            {/* Profile Dropdown Menu with Glassmorphism */}
            {isMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 backdrop-blur-lg bg-opacity-70 rounded-lg border shadow-lg transition-all duration-300 ${
                  isDarkMode ? "bg-gray-800/50 text-white" : "bg-white/50 text-black"
                }`}
              >
                <ul className="py-2">
                  <li
                    className="px-4 py-2 hover:bg-gray-500/30 rounded-md cursor-pointer transition-all duration-300"
                    onClick={logout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <w3m-button />
        )}
      </div>
    </div>
  );
}
