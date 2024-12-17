"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuthContext } from "../context/AuthContext";
import { PostProvider } from "../context/PostContext"; // Import PostProvider
import { useRouter } from "next/navigation";

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { walletAddress, activeProfile } = useAuthContext();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`flex flex-col top-[6vh] min-h-screen ${isDarkMode ? "bg-[#090909] text-white" : "bg-[#f5f5f5] text-black"}`}>
      <TopBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 justify-end">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
        />
        <main
          className={`transition-all duration-100 ${
            isSidebarOpen
              ? "md:ml-64 w-[calc(100%-16rem)]"
              : "md:ml-16 w-[calc(100%-4rem)]"
          } flex-1`}
        >
          {/* Wrap children in PostProvider */}
          <PostProvider>
            <div className={` ${isDarkMode ? "bg-[#090909] text-white" : "bg-[#f5f5f5] text-black"} p-4`}>
              {children}
            </div>
          </PostProvider>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
