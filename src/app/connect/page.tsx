"use client";

import { motion } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext";
import { useEffect } from "react";

export default function ConnectPage() {
  const { walletAddress, activeProfile, isConnected, fetchProfile } = useAuthContext();

  // Fetch profile if wallet is connected but activeProfile is not yet loaded
  useEffect(() => {
    if (isConnected && walletAddress && !activeProfile) {
      console.log("Fetching profile for connected wallet...");
      fetchProfile();
    }
  }, [walletAddress, isConnected, activeProfile, fetchProfile]);

  // Log the state once on component mount
  useEffect(() => {
    console.log("Wallet Address:", walletAddress);
    console.log("Active Profile:", activeProfile);
  }, [walletAddress, activeProfile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen heading">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Connect Your Wallet
      </motion.h2>

      {/* Case 1: No wallet connected */}
      {!isConnected || !walletAddress ? (
        <div className="mt-8 flex flex-col space-y-4">
          <w3m-button />
          <p className="mt-4 text-sm text-gray-400">Please connect your wallet to proceed.</p>
        </div>
      ) : /* Case 2: Wallet connected but no active profile found */
      !activeProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 bg-gray-100 p-4 rounded-md shadow-lg w-full max-w-md"
        >
          <h3 className="text-lg font-medium">No Profiles Found</h3>
          <p className="text-sm mt-2 text-gray-500">
            This wallet has no linked profiles. Please create or link a profile to continue.
          </p>
          <div className="mt-4 flex flex-col space-y-2">
            <motion.a
              href="/connect/create-profile"
              initial={{ opacity: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 text-center bg-blue-500 text-white rounded-md shadow-lg"
            >
              Create Profile
            </motion.a>
          </div>
        </motion.div>
      ) : /* Case 3: Wallet connected and active profile found */
      (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          {/* Interactive Dashboard Section */}
          <div className="p-6 bg-opacity-20 bg-white rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold">
              Welcome, {activeProfile.display_name || "User"}
            </h3>
            <p className="text-sm info mt-2">
              Manage your profiles, trends, and advertisements all in one place.
            </p>

            {/* Call to Action Row */}
            <div className="flex items-center mt-6">
              <div className="flex-1">
                <h4 className="text-lg font-bold">Discover Trending Content</h4>
                <p className="text-sm text-gray-400 mt-2">
                  Explore the latest trends and connect with your community.
                </p>
              </div>
              <motion.a
                href="/feed"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden w-64 h-40 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg cursor-pointer"
              >
                <div className="absolute inset-0 bg-black bg-opacity-25 hover:bg-opacity-50 transition-opacity duration-300"></div>
                <span className="absolute bottom-4 left-4 text-white font-semibold">
                  Go to Feed
                </span>
              </motion.a>
            </div>
          </div>

          {/* Action Landscape Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ActionCard
              title="Create Profile"
              href="/connect/create-profile"
              description="Set up your personal profile to get started."
            />
            <ActionCard
              title="Advertise"
              href="/connect/advertise"
              description="Reach your audience with powerful ads."
            />
            <ActionCard
              title="Trend"
              href="/trend"
              description="Showcase your project to the community."
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ActionCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
      <h4 className="text-lg font-bold text-white z-10 relative">{title}</h4>
      <p className="text-sm text-gray-400 mt-2 z-10 relative">{description}</p>
    </motion.a>
  );
}
