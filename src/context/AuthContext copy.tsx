"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter, projectId } from "../lib/config";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import Cookies from "js-cookie";

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

const queryClient = new QueryClient();

// Profile Interface
export interface Profile {
  id: string;
  displayName: string;
  username: string;
  about: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  membershipTier: string;
  profileType: string;
  role: string;
  walletAddress: string;
  accountIdentifier: string;
  blockchainWallet: string;
  email?: string;
  password?: string;
  shortId?: string;
  linked?: string[];
  links?: string[];
}

// AuthContext Type
export interface AuthContextType {
  walletAddress: string | null;
  accountIdentifier: string | null;
  blockchainWallet: string | null;
  profiles: Profile[];
  activeWallet: string | null;
  activeProfile: Profile | null;
  setActiveWallet: (walletAddress: string) => void;
  switchProfile: (walletAddress: string) => void;
  connect: (connector: Connector) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
  fetchProfiles: (accountIdentifier: string) => Promise<Profile[]>;
  logoutProfile: () => void; // New: Handles logout globally
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  cookies?: { walletAddress: string | null; accountIdentifier: string | null };
};




// Helper for localStorage
const storageHelper = {
  get: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  clear: (key: string) => {
    localStorage.removeItem(key);
  },
};

// AuthProvider Component
export const AuthProvider = ({ children, cookies }: AuthProviderProps) => {
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const handleConnect = async (connector: Connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const [walletAddress, setWalletAddress] = useState<string | null>(
    cookies?.walletAddress || storageHelper.get("walletAddress")
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    cookies?.accountIdentifier || storageHelper.get("accountIdentifier")
  );
  const [profiles, setProfiles] = useState<Profile[]>(
    storageHelper.get("profiles") || []
  );
  const [activeWallet, setActiveWallet] = useState<string | null>(
    storageHelper.get("activeWallet")
  );
  const [activeProfile, setActiveProfile] = useState<Profile | null>(
    storageHelper.get("activeProfile")
  );

  const profileCache = useRef<Map<string, Profile[]>>(new Map());

  const generateAccountIdentifier = () => `user-${crypto.randomUUID()}`;

  // Switch Profile
  const switchProfile = (wallet: string) => {
    const selectedProfile = profiles.find((p) => p.walletAddress === wallet);
    if (!selectedProfile) {
      console.error("Cannot switch to a non-existent profile:", wallet);
      return;
    }
    setActiveWallet(wallet);
    setActiveProfile(selectedProfile);
    storageHelper.set("activeWallet", wallet);
    storageHelper.set("activeProfile", selectedProfile);
  };

  // Fetch Profiles
  const fetchProfiles = async (identifier: string): Promise<Profile[]> => {
    if (profileCache.current.has(identifier)) {
      const cachedProfiles = profileCache.current.get(identifier)!;
      setProfiles(cachedProfiles);
      setActiveProfile(cachedProfiles[0] || null);
      storageHelper.set("profiles", cachedProfiles);
      storageHelper.set("activeProfile", cachedProfiles[0] || null);
      return cachedProfiles;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("account_identifier", identifier);

    if (error) {
      console.error("Error fetching profiles:", error.message);
      setProfiles([]);
      setActiveProfile(null);
      return [];
    }

    const formattedProfiles = (data || []).map((profile) => ({
      ...profile,
    }));

    setProfiles(formattedProfiles);
    setActiveProfile(formattedProfiles[0] || null);
    storageHelper.set("profiles", formattedProfiles);
    storageHelper.set("activeProfile", formattedProfiles[0] || null);
    profileCache.current.set(identifier, formattedProfiles);

    return formattedProfiles;
  };

  // Logout
  const logoutProfile = () => {
    setWalletAddress(null);
    setAccountIdentifier(null);
    setActiveWallet(null);
    setActiveProfile(null);
    setProfiles([]);
    profileCache.current.clear();
    storageHelper.clear("walletAddress");
    storageHelper.clear("accountIdentifier");
    storageHelper.clear("profiles");
    storageHelper.clear("activeWallet");
    storageHelper.clear("activeProfile");
    Cookies.remove("walletAddress");
    Cookies.remove("accountIdentifier");
  };

  useEffect(() => {
    if (isConnected && address) {
      const chainId = caipAddress?.split(":")[1] || null;
      const userId = Cookies.get("accountIdentifier") || generateAccountIdentifier();

      if (!Cookies.get("accountIdentifier")) {
        Cookies.set("accountIdentifier", userId, { path: "/", expires: 7 });
      }

      Cookies.set("walletAddress", address, { path: "/", expires: 7 });

      setAccountIdentifier(userId);
      setWalletAddress(address);
      fetchProfiles(userId);
    }
  }, [isConnected, address, caipAddress, status]);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            walletAddress,
            accountIdentifier,
            blockchainWallet: caipAddress || null, // Updated here
            profiles,
            activeWallet,
            activeProfile,
            setActiveWallet,
            switchProfile,
            connect:handleConnect,
            disconnect: async () => {
              logoutProfile();
              await wagmiDisconnect();
            },
            connectors,
            fetchProfiles,
            logoutProfile,
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// useAuthContext Hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
