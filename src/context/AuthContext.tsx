"use client";

import React, { createContext, useCallback, useState, useContext, useEffect, ReactNode } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter, projectId } from "../lib/config";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import Cookies from "js-cookie";
//import RedirectMessage from "../components/RedirectMessage";

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
  connect: (options: { connector: Connector; chainId?: number }) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
  fetchProfiles: () => Promise<void>;
  createProfile: (newProfileData: Profile) => Promise<void>;
  //redirectMessage: string | null;
 // setRedirectMessage: (message: string | null) => void;
}





const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  redirect?: (path: string) => void; 
  cookies?: { walletAddress: string | null; accountIdentifier: string | null };
};


const validateCookie = (
  key: string,
  value: string | null | undefined,
  prefix: string
): string | null => {
  if (value && value.startsWith(prefix)) {
    return value;
  }
  if (!value) return null; // Handle undefined/null properly
  console.warn(`Invalid cookie for key "${key}":`, value);
  return null;
};

export const AuthProvider = ({ children,  redirect = (path: string) => console.log(`Redirecting to: ${path}`), cookies }: AuthProviderProps) => {
  //const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(
    validateCookie("walletAddress", cookies?.walletAddress ?? null, "0x")
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    validateCookie("accountIdentifier", cookies?.accountIdentifier ?? null, "user-")
  );
  const [username] = useState<string | null>(null);
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const generateAccountIdentifier = () => `user-${crypto.randomUUID()}`;

  const switchProfile = (wallet: string) => {
    const profile = profiles.find((p) => p.walletAddress === wallet);
    if (profile) {
      setActiveProfile(profile);
    }
  };

  const createProfile = async (newProfileData: Profile) => {
    try {
      const existingProfile = profiles.find(
        (profile) => profile.walletAddress === newProfileData.walletAddress
      );
  
      if (existingProfile) {
        console.error("Profile already exists for this wallet address.");
        return;
      }
  
      const { error } = await supabase.from("profiles").insert(newProfileData);
  
      if (error) throw new Error(error.message);
  
      await fetchProfiles(); // Refresh profiles
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const fetchProfiles = useCallback(async () => {
    if (!walletAddress) return;
  
    try {
      // Check for cached profiles in localStorage
      const cachedProfiles = localStorage.getItem(`profiles_${walletAddress}`);
      if (cachedProfiles) {
        const parsedProfiles = JSON.parse(cachedProfiles);
        setProfiles(parsedProfiles);
        setActiveProfile(parsedProfiles[0] || null);
        return; // Skip API call if profiles are found in cache
      }
  
      // Fetch profiles from Supabase if not in cache
      const { data: existingProfiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", walletAddress);
  
      if (error) throw new Error(`Error fetching profiles: ${error.message}`);
  
      if (existingProfiles?.length) {
        // Update state with fetched profiles
        setProfiles(existingProfiles);
        setActiveProfile(existingProfiles[0]);
        setActiveWallet(walletAddress);
        setAccountIdentifier(existingProfiles[0].accountIdentifier);
  
        // Cache profiles in localStorage for reuse
        localStorage.setItem(`profiles_${walletAddress}`, JSON.stringify(existingProfiles));
  
        // Redirect to Overview immediately
        redirect("/auth/overview");
      } else {
        // No profiles found for the wallet
        setProfiles([]);
        setActiveProfile(null);
  
        const newAccountId = generateAccountIdentifier();
        setAccountIdentifier(newAccountId);
  
        // Redirect to Create Profile immediately
        redirect("/auth/create-profile");
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
  
      // Clear state on error
      setProfiles([]);
      setActiveProfile(null);
      setActiveWallet(null);
    }
  }, [walletAddress, redirect]);
  

  const handleConnect = async (options: { connector: Connector; chainId?: number }) => {
    try {
      await connect(options);
      console.log("Wallet connected successfully:", options.connector.name);
    } catch (error) {
      console.error("Error during wallet connection:", error);
    }
  };
  

  const handleDisconnect = async () => {
    console.log("Disconnecting wallet and clearing state...");
    try {
      await wagmiDisconnect();
      setWalletAddress(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      Cookies.remove("walletAddress");
      Cookies.remove("accountIdentifier");
      localStorage.removeItem(`profiles_${walletAddress}`);
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
    }
  };
  

  useEffect(() => {
    if (isConnected && address) {
      // Prevent unnecessary state updates
      if (walletAddress !== address) {
        setWalletAddress(address);
        Cookies.set("walletAddress", address, { expires: 7 });
      }
  
      // Ensure accountIdentifier is set
      if (!accountIdentifier) {
        const newAccountId = `user-${crypto.randomUUID()}`;
        setAccountIdentifier(newAccountId);
        Cookies.set("accountIdentifier", newAccountId, { expires: 7 });
      }
  
      // Update blockchain wallet only if necessary
      const chainId = caipAddress?.split(":")[1] || null;
      const newBlockchainWallet = `${chainId}:${address}`;
      if (blockchainWallet !== newBlockchainWallet) {
        setBlockchainWallet(newBlockchainWallet);
      }
  
      // Fetch profiles only if not already fetched
      if (!profiles.length) {
        fetchProfiles();
      }
    }
    // Only add non-changing variables to the dependency array
  }, [isConnected, address, caipAddress, walletAddress, accountIdentifier, blockchainWallet, profiles, fetchProfiles]);
  


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
          disconnect: handleDisconnect,
          connectors,
          connect: handleConnect,
          username,
          fetchProfiles,
          createProfile,
          //setRedirectMessage,
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