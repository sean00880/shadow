"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Connector } from "wagmi";
import { useAuthContext, Profile } from "../context/AuthContext";

interface TopBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  connect: (options: { connector: Connector; chainId?: number }) => Promise<void>;
  connectors: readonly Connector[];
  disconnect: () => Promise<void>;
  walletAddress: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
}

export default function TopBar({
  isDarkMode,
  toggleTheme,
  connect,
  connectors,
  disconnect,
  walletAddress,
  profiles,
  activeProfile,
}: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get switchProfile from AuthContext
  const { switchProfile } = useAuthContext();

  const profileImage =
    activeProfile?.profileImageUrl || "/images/default_logo.jpg";

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
    <div className="topbar flex items-center justify-between px-4 py-2 shadow-lg border-b border-gray-700">
      <div className="w-1/3"></div>

      {/* Centered Logo */}
      <div className="flex-1 flex justify-center items-center">
        <Image
          src={isDarkMode ? "/images/LOGODARK.png" : "/images/LogoLIGHT.png"}
          alt="Logo"
          width={240}
          height={40}
          className="glitch-effect"
        />
      </div>

      {/* Wallet/Profile Actions */}
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition ${
            isDarkMode ? "bg-[#090909] text-white" : "bg-white text-black"
          }`}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {walletAddress ? (
          <div
            className="relative"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
            ref={menuRef}
          >
            <Image
              src={profileImage}
              alt="Profile Image"
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
            />

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                <ul className="py-2">
                  {profiles.map((profile) => (
                    <li
                      key={profile.walletAddress}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                        activeProfile?.walletAddress === profile.walletAddress
                          ? "font-bold"
                          : ""
                      }`}
                      onClick={() => switchProfile(profile.walletAddress)}
                    >
                      {profile.displayName || profile.username}
                    </li>
                  ))}
                  <li
                    className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                    onClick={disconnect}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => connect({ connector })}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
