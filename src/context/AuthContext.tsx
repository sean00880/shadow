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

  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("walletAddress") || null : null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("accountIdentifier") || null : null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Memoized function to update wallet data
  const updateWalletData = useCallback(async () => {
    if (isConnected && caipAddress && walletAddress !== address) {
      const chainId = caipAddress.split(":")[1];
      setWalletAddress(address ?? null);
      localStorage.setItem("walletAddress", address ?? "");

      // Generate or fetch accountIdentifier
      if (!accountIdentifier) {
        const generatedAccountId = `user-${crypto.randomUUID()}`;
        setAccountIdentifier(generatedAccountId);
        localStorage.setItem("accountIdentifier", generatedAccountId);
      }

      setAccountIdentifier(caipAddress);
      localStorage.setItem("accountIdentifier", caipAddress);

      setBlockchainWallet(`${chainId}:${address ?? ""}`);
      Cookies.set("walletAddress", address ?? "", { expires: 7 });
      Cookies.set("accountIdentifier", caipAddress, { expires: 7 });
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
  }, [isConnected, caipAddress, address, walletAddress, accountIdentifier]);

  // Synchronize wallet data on connection state changes
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
      await updateWalletData(); // Reset wallet data
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
