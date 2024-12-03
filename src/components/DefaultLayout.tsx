"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuthContext } from "../context/AuthContext";
import { useProfileContext } from "../context/ProfileContext";
import { useRouter } from "next/navigation";

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { walletAddress } = useAuthContext();
  const { activeProfile } = useProfileContext();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
          } bg-background text-foreground flex-1`}
        >
          {
            children
          }
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
