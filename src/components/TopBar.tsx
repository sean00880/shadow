
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuthContext } from "../context/AuthContext";

export default function TopBar({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { walletAddress, disconnect } = useAuthContext();
  const { profiles, activeProfile, switchProfile } = useAuthContext();

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

  return (
    <div className="topbar flex items-center justify-between px-4 py-2 shadow-lg border-b border-gray-700">
      <div className="w-1/3"></div>
      <div className="flex-1 flex justify-center items-center">
        <Image src={isDarkMode ? "/images/LOGODARK.png" : "/images/LogoLIGHT.png"} alt="Logo" width={240} height={40} />
      </div>
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 rounded-full border">
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        {walletAddress && activeProfile ? (
          <div ref={menuRef} onMouseEnter={handleProfileHover} onMouseLeave={handleProfileLeave}>
            <Image src={profileImage} alt="Profile Image" width={40} height={40} className="rounded-full" />
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                <ul className="py-2">
                  {profiles.map((profile) => (
                    <li
                      key={profile.id}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                        activeProfile.id === profile.id ? "font-bold" : ""
                      }`}
                      onClick={() => switchProfile(profile.id)}
                    >
                      {profile.displayName || profile.username}
                    </li>
                  ))}
                  <li
                    className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      disconnect();
                     
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <>
         
          <w3m-button/>
          </>
        )}
      </div>
    </div>
  );
}
