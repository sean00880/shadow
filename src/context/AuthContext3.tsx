"use client";

//wallet connects and profile persists but only supports one profile.

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { wagmiAdapter, projectId } from "../lib/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";

// Initialize AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
  features: {
    analytics: true,
    email: true,
    socials: ["google", "x", "discord"],
  },
});

// Create a QueryClient instance
const queryClient = new QueryClient();

interface AuthContextType {
  displayName: string;
  setDisplayName: (name: string) => void;
  username: string;
  setUsername: (name: string) => void;
  about: string;
  setAbout: (about: string) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  bannerImage: string | null;
  setBannerImage: (image: string | null) => void;
  walletAddress: string | null;
  accountIdentifier: string | null;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  logout: () => void;
  connect: (connector: Connector) => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  cookies?: string | null;
};

export const AuthProvider = ({ children, cookies }: AuthProviderProps) => {
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // States for user profile
  const [displayName, setDisplayName] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("displayName") || "" : ""
  );
  const [username, setUsername] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("username") || "" : ""
  );
  const [about, setAbout] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("about") || "" : ""
  );
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("profileImage") || null : null
  );
  const [bannerImage, setBannerImage] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("bannerImage") || null : null
  );
  const [isVerified, setIsVerified] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("isVerified") === "true" : false
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("accountIdentifier") || null : null
  );

  // Ensure alertMessage is used properly in the component
  useEffect(() => {
    if (alertMessage) {
      alert(alertMessage); // Use alert or a modal
      setAlertMessage(null); // Reset after showing the message
    }
  }, [alertMessage]);

  // Sync accountIdentifier with wallet connection
  useEffect(() => {
    if (isConnected && caipAddress) {
      setAccountIdentifier(caipAddress);
      if (typeof window !== "undefined") {
        localStorage.setItem("accountIdentifier", caipAddress);
      }
    }
  }, [isConnected, caipAddress]);

  // Sync states with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("username", username);
      localStorage.setItem("about", about);

      if (profileImage) {
        localStorage.setItem("profileImage", profileImage);
      } else {
        localStorage.removeItem("profileImage");
      }

      if (bannerImage) {
        localStorage.setItem("bannerImage", bannerImage);
      } else {
        localStorage.removeItem("bannerImage");
      }

      localStorage.setItem("isVerified", isVerified.toString());
    }
  }, [displayName, username, about, profileImage, bannerImage, isVerified]);

  // Load profile data if connected
  useEffect(() => {
    if (isConnected && accountIdentifier) {
      setDisplayName(localStorage.getItem("displayName") || "");
      setUsername(localStorage.getItem("username") || "");
    }
  }, [isConnected, accountIdentifier]);

  // Handle cookies for debugging
  useEffect(() => {
    if (cookies) {
      console.log("Cookies received:", cookies);
    }
  }, [cookies]);

  // Logout functionality
  const logout = async () => {
    setDisplayName("");
    setUsername("");
    setAbout("");
    setProfileImage(null);
    setBannerImage(null);
    setIsVerified(false);
    setAccountIdentifier(null);

    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    // Disconnect wallet via AppKit
    try {
      await appKit.adapter?.connectionControllerClient?.disconnect();
    } catch (error) {
      console.error("Wallet disconnect error:", error);
    }
  };

  // Connection logic
  const handleConnect = async (connector: Connector): Promise<void> => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Connection failed:", error);
      setAlertMessage("Wallet connection failed. Please try again.");
    }
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            displayName,
            setDisplayName,
            username,
            setUsername,
            about,
            setAbout,
            profileImage,
            setProfileImage,
            bannerImage,
            setBannerImage,
            walletAddress: address ?? null,
            accountIdentifier,
            isVerified,
            setIsVerified,
            logout,
            connect: handleConnect,
            connectors,
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};