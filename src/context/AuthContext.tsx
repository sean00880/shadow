"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from "react";
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
  username: string | null;
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
  fetchProfiles: (accountIdentifier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  cookies?: { walletAddress: string | null; accountIdentifier: string | null };
};

// Helper function for cookie validation
const validateCookie = (key: string, value: string | null | undefined, prefix: string): string | null => {
  if (value && value.startsWith(prefix)) {
    return value;
  }
  console.warn(`Invalid cookie for key "${key}":`, value);
  return null;
};


export const AuthProvider = ({ children, cookies }: AuthProviderProps) => {
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();

  // Use cookies for initial state
  const [walletAddress, setWalletAddress] = useState<string | null>(
    validateCookie("walletAddress", cookies?.walletAddress ?? null, "0x")
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    validateCookie("accountIdentifier", cookies?.accountIdentifier ?? null, "user-")
  );
  

  // Remaining state variables remain unchanged
  const [username, setUsername] = useState<string | null>(null);
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const profileCache = useRef<Map<string, Profile[]>>(new Map());

  const generateAccountIdentifier = () => `user-${crypto.randomUUID()}`;

  const switchProfile = (wallet: string) => {
    if (!profiles.some((p) => p.walletAddress === wallet)) {
      console.error("Cannot switch to a non-existent profile:", wallet);
      return;
    }
    setActiveWallet(wallet);
    setActiveProfile(profiles.find((p) => p.walletAddress === wallet) || null);
  };

  const fetchProfiles = async (identifier: string) => {
    try {
      if (profileCache.current.has(identifier)) {
        setProfiles(profileCache.current.get(identifier)!);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, username, about, profile_image_url, banner_image_url, membership_tier, profile_type, role, wallet_address, account_identifier, blockchain_wallet, email, password, short_id, linked, links"
        )
        .eq("account_identifier", identifier);

      if (error) throw new Error(error.message);

      const formattedData = (data || []).map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
        username: profile.username,
        about: profile.about,
        profileImageUrl: profile.profile_image_url,
        bannerImageUrl: profile.banner_image_url,
        membershipTier: profile.membership_tier,
        profileType: profile.profile_type,
        role: profile.role,
        walletAddress: profile.wallet_address,
        accountIdentifier: profile.account_identifier,
        blockchainWallet: profile.blockchain_wallet,
        email: profile.email,
        password: profile.password,
        shortId: profile.short_id,
        linked: profile.linked,
        links: profile.links,
      }));

      profileCache.current.set(identifier, formattedData);
      setProfiles(formattedData);
      setUsername(formattedData[0]?.username || null);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setProfiles([]);
      setUsername(null);
    }
  };

  // Event synchronization across tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "walletAddress" || event.key === "accountIdentifier") {
        setWalletAddress(Cookies.get("walletAddress") || null);
        setAccountIdentifier(Cookies.get("accountIdentifier") || null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    console.log("Wallet connection status changed:", { isConnected, address, caipAddress, status });

    if (status === "connecting" || status === "reconnecting") {
      console.log("Wallet is connecting or reconnecting...");
      return;
    }

    if (isConnected && address) {
      const chainId = caipAddress?.split(":")[1] || null;
      const userId = Cookies.get("accountIdentifier") || generateAccountIdentifier();

      if (!Cookies.get("accountIdentifier")) {
        Cookies.set("accountIdentifier", userId, { path: "/", expires: 7 });
      }

      Cookies.set("walletAddress", address, { path: "/", expires: 7 });

      setAccountIdentifier(userId);
      setWalletAddress(address);
      setBlockchainWallet(caipAddress || `${chainId}:${address}`);

      fetchProfiles(userId);
    }
  }, [isConnected, address, caipAddress, status]);

  const handleConnect = async (connector: Connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    setWalletAddress(null);
    setAccountIdentifier(null);
    setBlockchainWallet(null);
    setActiveWallet(null);
    setActiveProfile(null);
    setProfiles([]);
    profileCache.current.clear();
    Cookies.remove("walletAddress");
    Cookies.remove("accountIdentifier");
    await wagmiDisconnect();
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            walletAddress,
            accountIdentifier,
            blockchainWallet,
            profiles,
            activeWallet,
            activeProfile,
            setActiveWallet,
            switchProfile,
            connect: handleConnect,
            disconnect: handleDisconnect,
            connectors,
            username,
            fetchProfiles,
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