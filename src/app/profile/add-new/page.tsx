"use client";

import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import LinkProfiles from "../../../../src/components/LinkProfiles";

export default function SettingsPage() {
  const { profiles, activeProfile, isConnected, walletAddress } = useAuthContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <main
      className={`settings-page min-h-screen p-8 ${
        isDarkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <header className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-yellow-accent" : "text-blue-accent"}`}>
          Profile Settings
        </h1>
        <button
          className={`toggle-dark-mode px-4 py-2 rounded ${
            isDarkMode ? "bg-yellow-accent text-dark" : "bg-blue-accent text-light"
          }`}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </button>
      </header>

      {isConnected ? (
        <>
          <section className={`glass p-6 rounded-xl ${isDarkMode ? "bg-opacity-50" : "bg-opacity-30"}`}>
            <h2 className={`text-2xl mb-4 ${isDarkMode ? "text-yellow-accent" : "text-blue-accent"}`}>
              Linked Profiles
            </h2>
            <p>Active Wallet: {walletAddress}</p>
            <p>Active Profile: {activeProfile?.username || "None selected"}</p>
            <LinkProfiles isDarkMode={isDarkMode} />
          </section>
        </>
      ) : (
        <p className="text-center">Please connect a wallet to manage profiles.</p>
      )}
    </main>
  );
}
