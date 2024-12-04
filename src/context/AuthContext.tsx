"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { createAppKit } from "@reown/appkit";
import { supabase } from "../utils/supaBaseClient";
import Cookies from "js-cookie";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, base, bsc } from "@reown/appkit/networks";

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
  walletAddress: string | null;
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

  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    isBrowser ? localStorage.getItem("walletAddress") : null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    isBrowser ? localStorage.getItem("accountIdentifier") : null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(() =>
    isBrowser ? localStorage.getItem("blockchainWallet") : null
  );
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    isBrowser ? JSON.parse(localStorage.getItem("profiles") || "[]") : []
  );
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() =>
    isBrowser ? JSON.parse(localStorage.getItem("activeProfile") || "null") : null
  );
  const [isSwitchingProfile, setIsSwitchingProfile] = useState<boolean>(false); // Track switching state

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

          if (isBrowser) {
            localStorage.setItem("profiles", JSON.stringify(data));
            localStorage.setItem("activeProfile", JSON.stringify(defaultProfile));
            localStorage.setItem("accountIdentifier", defaultProfile.accountIdentifier);
            Cookies.set("accountIdentifier", defaultProfile.accountIdentifier, { expires: 7 });
          }
        } else {
          setProfiles([]);
          setActiveProfile(null);

          const generatedId = `user-${crypto.randomUUID()}`;
          setAccountIdentifier(generatedId);

          if (isBrowser) {
            localStorage.setItem("accountIdentifier", generatedId);
            Cookies.set("accountIdentifier", generatedId, { expires: 7 });
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [walletAddress, isBrowser]
  );

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      setBlockchainWallet(caipAddress || null);

      if (isBrowser) {
        localStorage.setItem("walletAddress", address);
        localStorage.setItem("blockchainWallet", caipAddress || "");
      }

      fetchProfiles(address);
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
    try {
      await wagmiDisconnect();
      setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);

      if (isBrowser) {
        localStorage.clear();
        Cookies.remove("accountIdentifier");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
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
