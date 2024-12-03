"use client";

import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { useAuthContext } from "../../../context/AuthContext";

export default function ConnectPage() {
  const { walletAddress, blockchainWallet, isConnecting, profiles, activeProfile, switchProfile } = useAuthContext();


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-bold"
      >
        Connect Your Wallet
      </motion.h2>

      {isConnecting ? (
        <div className="mt-8">
          <ClipLoader color="#4A90E2" loading size={50} />
          <p className="mt-4 text-sm text-gray-500">
            {isConnecting ? "Connecting your wallet..." : "Loading profiles..."}
          </p>
        </div>
      ) : activeProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 bg-gray-100 p-4 rounded-md shadow-lg w-full max-w-md"
        >
          <h3 className="text-lg font-medium">Wallet Connected</h3>
          <p className="text-sm">Wallet Address: {walletAddress}</p>
          <p className="text-sm">Blockchain Wallet: {blockchainWallet}</p>

          {profiles.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-md font-medium">Linked Profiles:</h4>
              <ul className="mt-2 space-y-2">
                {profiles.map((profile) => (
                  <li
                    key={profile.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      activeProfile?.id === profile.id
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300"
                    }`}
                    onClick={() => switchProfile(profile.id)}
                  >
                    <p className="font-medium">{profile.displayName || profile.username}</p>
                    <p className="text-sm text-gray-500">Wallet: {profile.walletAddress}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No linked profiles found. Please create a profile.
            </p>
          )}
        </motion.div>
      ) : (
        <div className="mt-8 flex flex-col space-y-4">
          <p className="text-sm text-gray-500">No wallet connected. Please connect.</p>
          <w3m-button />
        </div>
      )}
    </div>
  );
}
