"use client";

import React, { useState, useMemo } from "react";
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

  // Pre-compute route logic based on the current wallet and profiles
  const redirectRoute = useMemo(() => {
    if (!walletAddress) {
      return "/auth/connect";
    }

    if (profiles.length === 0 && accountIdentifier) {
      fetchProfiles(); // Trigger fetch if profiles are missing
    }

    const linkedProfile = profiles.find(
      (profile) => profile.walletAddress === activeWallet
    );

    if (!linkedProfile) {
      return "/auth/create-profile";
    }

    if (activeWallet && linkedProfile) {
      setActiveWallet(activeWallet); // Ensure activeWallet is set
      return "/auth/overview";
    }

    return null; // No redirection needed
  }, [
    walletAddress,
    profiles,
    activeWallet,
    accountIdentifier,
    fetchProfiles,
    setActiveWallet,
  ]);

  // Perform redirection only if a route is computed
  if (redirectRoute) {
    router.push(redirectRoute);
    return null; // Prevent rendering the rest of the layout during redirect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        connect={(connector) => connect({ connector })} 
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
