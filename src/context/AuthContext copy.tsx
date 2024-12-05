"use client";

//profile persists but wallet doesn't connect

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { createAppKit } from "@reown/appkit";
import { supabase } from "../utils/supaBaseClient";
import Cookies from "js-cookie";
import { wagmiAdapter, projectId } from "../lib/config";
import { useRef } from "react";
import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { mainnet, sepolia, bsc, base } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia, bsc, base],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [base.id]: http(),
      [bsc.id]: http(),
    },
  });
}

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

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
  accountIdentifier: string | null;
  blockchainWallet: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  isConnected: boolean;
  isSwitchingProfile: boolean; // Add a loading state for switching
  setActiveProfile: (profile: Profile | null) => void;
  switchProfile: (profileId: string) => void;
  fetchProfiles: (wallet?: string | null) => Promise<void>;
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

  const isBrowser = typeof window !== "undefined";

  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("accountIdentifier") || null : null
  );

  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("blockchainWallet") : null
  );
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("profiles") || "[]") : []
  );
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("activeProfile") || "null") : null
  );
  const [isSwitchingProfile, setIsSwitchingProfile] = useState<boolean>(false); // Track switching state



  const fetchProfiles = useCallback(
    async (wallet: string | null = address ?? null) => {
      console.log("[fetchProfiles] Called with wallet:", wallet);
      if (!wallet) {
        console.log("[fetchProfiles] Wallet is null, skipping.");
        return;
      }
  
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);
  
        if (error) {
          console.error("[fetchProfiles] Error fetching profiles:", error.message);
          throw error;
        }
  
        if (data?.length) {
          console.log("[fetchProfiles] Profiles fetched:", data);
          setProfiles(data);
          const defaultProfile = data[0];
          setActiveProfile(defaultProfile);
          setAccountIdentifier(defaultProfile.accountIdentifier);
  
          if (isBrowser) {
            console.log("[fetchProfiles] Saving profiles to localStorage.");
            localStorage.setItem("profiles", JSON.stringify(data));
            localStorage.setItem("activeProfile", JSON.stringify(defaultProfile));
            localStorage.setItem("accountIdentifier", defaultProfile.accountIdentifier);
            Cookies.set("accountIdentifier", defaultProfile.accountIdentifier, { expires: 7 });
          }
        } else {
          console.log("[fetchProfiles] No profiles found for wallet:", wallet);
          setProfiles([]);
          setActiveProfile(null);
          const generatedId = `user-${crypto.randomUUID()}`;
          setAccountIdentifier(generatedId);
  
          if (isBrowser) {
            console.log("[fetchProfiles] Saving generated accountIdentifier:", generatedId);
            localStorage.setItem("accountIdentifier", generatedId);
            Cookies.set("accountIdentifier", generatedId, { expires: 7 });
          }
        }
      } catch (error) {
        console.error("[fetchProfiles] Error:", error);
      }
    },
    [address, isBrowser]
  );
  

  const hasFetchedProfiles = useRef(false);

  useEffect(() => {
    if (isConnected && address && !hasFetchedProfiles.current) {
      console.log("[useEffect:isConnected] Fetching profiles for the first time.");
      fetchProfiles(address);
      setBlockchainWallet(caipAddress || null);

      if (isBrowser) {
        localStorage.setItem("blockchainWallet", caipAddress || "");
      }

      hasFetchedProfiles.current = true;
    }
  }, [isConnected, address, caipAddress, fetchProfiles, isBrowser]);

  const switchProfile = async (profileId: string) => {
    setIsSwitchingProfile(true);
    try {
      const selectedProfile = profiles.find((profile) => profile.id === profileId);
      if (selectedProfile) {
        setActiveProfile(selectedProfile);
        setAccountIdentifier(selectedProfile.accountIdentifier);

        if (isBrowser) {
          localStorage.setItem("activeProfile", JSON.stringify(selectedProfile));
          localStorage.setItem("accountIdentifier", selectedProfile.accountIdentifier);
          Cookies.set("accountIdentifier", selectedProfile.accountIdentifier, { expires: 7 });
        }
      } else {
        console.error("Profile with ID not found:", profileId);
      }
    } catch (error) {
      console.error("Error switching profiles:", error);
    } finally {
      setIsSwitchingProfile(false);
    }
  };

  const logout = async () => {
    console.log("[disconnect] Attempting to disconnect.");
    try {
      await wagmiDisconnect();
      console.log("[disconnect] Successfully disconnected.");
      hasFetchedProfiles.current = false;
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null);

      if (isBrowser) {
        localStorage.clear();
      }
    } catch (error) {
      console.error("[disconnect] Error disconnecting:", error);
    }
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            accountIdentifier,
            blockchainWallet,
            profiles,
            activeProfile,
            isConnected,
            isSwitchingProfile,
            setActiveProfile,
            switchProfile,
            logout,
            fetchProfiles,
            connect: async (connector: Connector) => await connect({ connector }),
            disconnect: async () => await wagmiDisconnect(),
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
