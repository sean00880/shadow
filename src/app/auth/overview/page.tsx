"use client";

import { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfileOverviewPage() {
  const {
    activeProfile,
    activeWallet,
    blockchainWallet,
    disconnect,
    profiles,
    walletAddress,
    switchProfile,
  } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Centralized redirect logic using immediate checks
  

  // Redirect early if conditions are not met
  

  const handleLogout = async () => {
    setLoading(true);
    try {
      await disconnect();
      router.replace("/auth/connect");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProfile = (walletAddress: string) => {
    try {
      console.log("Switching profile to wallet:", walletAddress);
      switchProfile(walletAddress);
    } catch (error) {
      console.error("Error switching profile:", error);
    }
  };

  // Safe rendering of the profile information
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col items-center justify-center p-6">
      <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Banner Image */}
        <div className="text-center">
          {activeProfile?.bannerImageUrl ? (
            <Image
              src={activeProfile.bannerImageUrl}
              alt="Banner"
              width={500}
              height={200}
              className="rounded-md"
            />
          ) : (
            <div className="h-32 bg-gray-700 rounded-md"></div>
          )}
        </div>

        {/* Profile Image */}
        <div className="text-center mt-4">
          {activeProfile?.profileImageUrl ? (
            <Image
              src={activeProfile.profileImageUrl}
              alt="Profile"
              width={96}
              height={96}
              className="rounded-full mx-auto"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-500 rounded-full mx-auto"></div>
          )}
        </div>

        {/* Profile Details */}
        <h3 className="text-2xl font-bold mt-4">
          {activeProfile?.displayName || "No display name"}
        </h3>
        <p className="text-sm text-gray-400">
          @{activeProfile?.username || "No username"}
        </p>
        <p className="mt-2">
          {activeProfile?.about || "No additional information available."}
        </p>

        {/* Additional Profile Information */}
        <div className="mt-4">
          <p>
            <strong>Membership:</strong>{" "}
            {activeProfile?.membershipTier || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {activeProfile?.role || "N/A"}
          </p>
          <p>
            <strong>Profile Type:</strong> {activeProfile?.profileType || "N/A"}
          </p>
          <p>
            <strong>Blockchain Wallet:</strong> {blockchainWallet || "N/A"}
          </p>
          <p>
            <strong>Wallet Address:</strong> {walletAddress || "N/A"}
          </p>
        </div>

        {/* Switch Profile Dropdown */}
        <div className="mt-6">
          <strong>Switch Profile:</strong>
          <select
            className="block w-full mt-2 p-2 bg-gray-700 text-white rounded-md"
            onChange={(e) => handleSwitchProfile(e.target.value)}
            value={activeWallet || ""}
          >
            {profiles.map((profile) => (
              <option key={profile.walletAddress} value={profile.walletAddress}>
                {profile.displayName || profile.username || "Unnamed Profile"}
              </option>
            ))}
          </select>
        </div>

        {/* Logout Button */}
        <button
          className={`mt-6 px-4 py-2 rounded-md transition ${
            loading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Logging Out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
