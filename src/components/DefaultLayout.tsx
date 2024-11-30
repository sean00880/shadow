"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuthContext } from "../context/AuthContext";

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    activeWallet,
    profiles,
    activeProfile,
    setActiveWallet,
    connect,
    connectors,
    disconnect,
    walletAddress,
    fetchProfiles,
    accountIdentifier,
  } = useAuthContext();

  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  // Fetch profiles and handle wallet redirection dynamically
  useEffect(() => {
    const handleWalletAndProfile = async () => {
      if (!walletAddress) {
        router.replace("/auth/connect");
        return;
      }

      // Fetch profiles if not already loaded
      if (profiles.length === 0 && accountIdentifier) {
        await fetchProfiles(accountIdentifier);
      }

      // Redirect based on profiles
      const linkedProfile = profiles.find(
        (profile) => profile.walletAddress === activeWallet
      );
      if (!linkedProfile) {
        router.replace("/auth/create-profile");
      } else if (activeWallet) {
        setActiveWallet(activeWallet); // Ensure activeWallet is set
        router.replace("/auth/overview");
      }
    };

    handleWalletAndProfile();
  }, [
    walletAddress,
    profiles,
    activeWallet,
    accountIdentifier,
    fetchProfiles,
    setActiveWallet,
    router,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        connect={connect}
        connectors={connectors}
        disconnect={disconnect}
        walletAddress={walletAddress}
        profiles={profiles}
        activeProfile={activeProfile}
      />
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;