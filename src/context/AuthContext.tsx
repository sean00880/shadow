"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import { wagmiAdapter, projectId } from "../lib/config";
import debounce from "lodash.debounce"; // For debouncing wallet updates
import { mainnet, sepolia, bsc, base } from "wagmi/chains";
import { createAppKit } from "@reown/appkit";



export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});


export interface Profile {
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
  blockchainWallet: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  isConnected: boolean;
  isSwitchingProfile: boolean;
  setActiveProfile: (profile: Profile | null) => void;
  switchProfile: (profileId: string) => void;
  fetchProfiles: (wallet: string | null) => Promise<void>;
  logout: () => void;
  connect: (connector: Connector) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

type CaipAddress =
  | `eip155:${string}:${string}`
  | `solana:${string}:${string}`
  | `polkadot:${number}:${string}`
  | `solana:${number}:${string}`
  | undefined;


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(null);
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState<boolean>(false);

  // Fetch profiles by wallet address
  const fetchProfiles = useCallback(
    async (wallet: string | null) => {
      if (!wallet) return;

      // Use cached profiles if available
      const cachedProfiles = localStorage.getItem(`profiles_${wallet}`);
      if (cachedProfiles) {
        const parsedProfiles = JSON.parse(cachedProfiles);
        setProfiles(parsedProfiles);

        // Set the first profile as active
        setActiveProfile(parsedProfiles[0] || null);
        return;
      }

      // Fetch profiles from Supabase
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);

        if (error) throw new Error(error.message);

        if (data?.length) {
          setProfiles(data);
          setActiveProfile(data[0]);

          // Cache profiles in localStorage
          localStorage.setItem(`profiles_${wallet}`, JSON.stringify(data));
        } else {
          setProfiles([]);
          setActiveProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    []
  );

  // Debounced wallet update to prevent flickering
  const debouncedUpdateWallet = useCallback(
    debounce((newAddress: string | null, caip: string | null | undefined) => {
      setWalletAddress(newAddress);
      setBlockchainWallet(caip || null);

      if (newAddress) {
        fetchProfiles(newAddress);

        // Store wallet in localStorage
        localStorage.setItem("walletAddress", newAddress);
      }
    }, 300),
    [fetchProfiles]
  );

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      debouncedUpdateWallet(address, caipAddress);
    }
  }, [isConnected, address, caipAddress, debouncedUpdateWallet]);

  // Rehydrate profiles on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWallet = localStorage.getItem("walletAddress");
      const storedProfile = localStorage.getItem("activeProfile");

      if (storedWallet) setWalletAddress(storedWallet);
      if (storedProfile) setActiveProfile(JSON.parse(storedProfile));
    }
  }, []);

  const switchProfile = async (profileId: string) => {
    setIsSwitchingProfile(true);
    try {
      const selectedProfile = profiles.find((profile) => profile.id === profileId);
      if (selectedProfile) {
        setActiveProfile(selectedProfile);

        if (typeof window !== "undefined") {
          localStorage.setItem("activeProfile", JSON.stringify(selectedProfile));
        }
      }
    } catch (error) {
      console.error("Error switching profiles:", error);
    } finally {
      setIsSwitchingProfile(false);
    }
  };

  const logout = async () => {
    try {
      await wagmiDisconnect();
      setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);

      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (

        <AuthContext.Provider
          value={{
            walletAddress,
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
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
