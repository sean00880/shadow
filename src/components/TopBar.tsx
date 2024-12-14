import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuthContext } from "../context/AuthContext";

type TopBarProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export default function TopBar({ isDarkMode, toggleTheme }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { walletAddress, logout, profiles, activeProfile, switchProfile } = useAuthContext();

  const profileImage = activeProfile?.profileImageUrl || "/images/default_logo.jpg";

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

  const filteredProfiles = profiles.filter((profile) =>
    profile.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 shadow-lg border-b transition-colors duration-300 ${
        isDarkMode ? "bg-[#090909] text-white border-gray-700" : "bg-[#f5f5f5] text-black border-gray-300"
      }`}
    >
      <div className="w-1/3 flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search profiles..."
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
            isDarkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
          }`}
        />
      </div>
      <div className="flex-1 flex justify-center items-center">
        <Image
          src={isDarkMode ? "/images/LOGODARK.png" : "/images/LogoLIGHT.png"}
          alt="Logo"
          width={240}
          height={40}
        />
      </div>
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        {walletAddress && activeProfile ? (
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={handleProfileHover}
            onMouseLeave={handleProfileLeave}
          >
            <Image
              src={profileImage}
              alt="Profile Image"
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
            />
            
            {isMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 shadow-lg rounded-md border transition-colors duration-300 ${
                  isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-black"
                }`}
              >
                <ul className="py-2">
                  {filteredProfiles.map((profile) => (
                    <li
                      key={profile.id}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        activeProfile.id === profile.id ? "font-bold" : ""
                      }`}
                      onClick={() => switchProfile(profile.id)}
                    >
                      {profile.displayName || profile.username}
                    </li>
                  ))}
                  <li
                    className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
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
