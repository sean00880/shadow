"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { wagmiAdapter, projectId } from "../lib/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { createAppKit } from "@reown/appkit";
import { supabase } from "../utils/supaBaseClient";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import Cookies from "js-cookie";
import { useCallback } from "react";

// Initialize AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

// Create a QueryClient instance
const queryClient = new QueryClient();

interface Profile {
  id: string;
  displayName: string;
  username: string;
  about: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  walletAddress: string;
  accountIdentifier: string;
}

interface AuthContextType {
  walletAddress: string | null;
  accountIdentifier: string | null;
  blockchainWallet: string | null; // CAIP address
  isConnecting: boolean; // Wallet connection state
  profiles: Profile[];
  activeProfile: Profile | null;
  isConnected: boolean;
  setActiveProfile: (profile: Profile | null) => void;
  switchProfile: (profileId: string) => void;
  fetchProfiles: (wallet: string | null) => Promise<void>; // Added fetchProfiles
  logout: () => void;
  connect: (connector: Connector) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  // States
  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("walletAddress") : null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("accountIdentifier") : null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null); // Added blockchainWallet
  const [isConnecting, setIsConnecting] = useState<boolean>(false); // Added isConnecting
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("profiles") || "[]")
      : []
  );
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() =>
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("activeProfile") || "null")
      : null
  );

  // Fetch profiles from Supabase
  const fetchProfiles = useCallback(
    async (wallet: string | null = walletAddress) => {
      if (!wallet) return;
  
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);
  
        if (error) throw new Error(error.message);
  
        if (data?.length) {
          setProfiles(data);
          const defaultProfile = data[0];
          setActiveProfile(defaultProfile);
          setAccountIdentifier(defaultProfile.accountIdentifier);
  
          // Sync with localStorage
          localStorage.setItem("profiles", JSON.stringify(data));
          localStorage.setItem("activeProfile", JSON.stringify(defaultProfile));
          localStorage.setItem("accountIdentifier", defaultProfile.accountIdentifier);
          Cookies.set("accountIdentifier", defaultProfile.accountIdentifier, { expires: 7 });
        } else {
          setProfiles([]);
          setActiveProfile(null);
  
          // Generate a fallback accountIdentifier if none exists
          const generatedId = `user-${crypto.randomUUID()}`;
          setAccountIdentifier(generatedId);
          Cookies.set("accountIdentifier", generatedId, { expires: 7 });
          localStorage.setItem("accountIdentifier", generatedId);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [walletAddress, setProfiles, setActiveProfile, setAccountIdentifier]
  );
  
  

  // Handle wallet and profile state updates
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      setBlockchainWallet(caipAddress || null); // Update CAIP address
      localStorage.setItem("walletAddress", address);
      fetchProfiles(address);
    } else {
      setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
  
      // Clear localStorage and cookies
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("profiles");
      localStorage.removeItem("activeProfile");
      localStorage.removeItem("accountIdentifier");
      Cookies.remove("accountIdentifier");
    }
  }, [isConnected, address, caipAddress, fetchProfiles]);
  

  // Switch active profile
  const switchProfile = (profileId: string) => {
    const selectedProfile = profiles.find((profile) => profile.id === profileId);
    if (selectedProfile) {
      setActiveProfile(selectedProfile);
      setAccountIdentifier(selectedProfile.accountIdentifier);

      // Sync with localStorage
      localStorage.setItem("activeProfile", JSON.stringify(selectedProfile));
      localStorage.setItem("accountIdentifier", selectedProfile.accountIdentifier);
      Cookies.set("accountIdentifier", selectedProfile.accountIdentifier, { expires: 7 });
    } else {
      console.error("Profile with ID not found:", profileId);
    }
  };

  // Logout functionality
  const logout = async () => {
    setWalletAddress(null);
    setBlockchainWallet(null); // Clear blockchainWallet
    setProfiles([]);
    setActiveProfile(null);
    setAccountIdentifier(null);

    // Clear localStorage
    localStorage.clear();
    Cookies.remove("accountIdentifier");

    try {
      await wagmiDisconnect();
    } catch (error) {
      console.error("Wallet disconnect error:", error);
    }
  };

  const handleConnect = async (connector: Connector): Promise<void> => {
    setIsConnecting(true);
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false); // Ensure isConnecting resets
    }
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            walletAddress,
            accountIdentifier,
            blockchainWallet,
            isConnecting,
            profiles,
            activeProfile,
            isConnected,
            setActiveProfile,
            switchProfile,
            logout,
            fetchProfiles,
            connect: handleConnect,
            disconnect: async () => {
              await wagmiDisconnect();
            },
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
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
