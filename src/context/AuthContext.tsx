"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, sepolia, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import Cookies from "js-cookie";
import { supabase } from "../utils/supaBaseClient";

import {
  createConfig,
  http,
  cookieStorage,
  createStorage,
} from "wagmi";

// Initialize AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

export function wagmiConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}

const queryClient = new QueryClient();

export interface AuthContextType {
  walletAddress: string | null;
  accountIdentifier: string | null;
  blockchainWallet: string | null;
  setAccountIdentifier: (accountIdentifier: string | null) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (options: { connector: Connector; chainId?: number }) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => Cookies.get("walletAddress") || null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    () => Cookies.get("accountIdentifier") || null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Function to fetch or generate accountIdentifier
  const fetchOrGenerateAccountIdentifier = useCallback(async (walletAddress: string | null) => {
    if (!walletAddress) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("accountIdentifier")
        .eq("wallet_address", walletAddress)
        .single();

      if (error) {
        console.error("Error fetching accountIdentifier:", error.message);
      }

      if (data?.accountIdentifier) {
        return data.accountIdentifier;
      } else {
        // Generate a new accountIdentifier if it doesn't exist in the database
        const newAccountIdentifier = `user-${crypto.randomUUID()}`;
        return newAccountIdentifier;
      }
    } catch (error) {
      console.error("Error generating accountIdentifier:", error);
      return null;
    }
  }, []);

  // Memoized function to update wallet and account data
  const updateWalletData = useCallback(async () => {
    if (isConnected && address) {
      const chainId = caipAddress?.split(":")[1] || "1";
      setWalletAddress(address);
      Cookies.set("walletAddress", address, { expires: 7 });

      const fetchedAccountIdentifier = await fetchOrGenerateAccountIdentifier(address);
      if (fetchedAccountIdentifier) {
        setAccountIdentifier(fetchedAccountIdentifier);
        Cookies.set("accountIdentifier", fetchedAccountIdentifier, { expires: 7 });
        localStorage.setItem("accountIdentifier", fetchedAccountIdentifier);
      }

      setBlockchainWallet(`${chainId}:${address}`);
    } else {
      // Clear wallet-related data when disconnected
      setWalletAddress(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null);
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("accountIdentifier");
      Cookies.remove("walletAddress");
      Cookies.remove("accountIdentifier");
    }
  }, [isConnected, address, caipAddress, fetchOrGenerateAccountIdentifier]);

  // Synchronize wallet and account data on connection state changes
  useEffect(() => {
    updateWalletData();
  }, [updateWalletData]);

  const handleConnect = async (options: { connector: Connector; chainId?: number }) => {
    setIsConnecting(true);
    try {
      await connect(options);
    } catch (error) {
      console.error("Error during wallet connection:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await wagmiDisconnect();
      await updateWalletData(); // Ensure wallet data is reset on disconnect
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
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
            setAccountIdentifier,
            isConnected,
            isConnecting,
            connect: handleConnect,
            disconnect: handleDisconnect,
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
