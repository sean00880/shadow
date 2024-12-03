"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
  blockchainWallet: string | null; // Added back
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
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null); // Added back
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync accountIdentifier and blockchainWallet with wallet connection
  useEffect(() => {
    if (isConnected && caipAddress) {
      setAccountIdentifier(caipAddress);
      Cookies.set("accountIdentifier", caipAddress, { expires: 7 });

      // Extract the chain ID from caipAddress and set blockchainWallet
      const chainId = caipAddress.split(":")[1];
      setBlockchainWallet(`${chainId}:${address}`);
    }
  }, [isConnected, caipAddress, address]);

  // Save walletAddress to Cookies on successful connection
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      Cookies.set("walletAddress", address, { expires: 7 });
    } else {
      setWalletAddress(null);
      Cookies.remove("walletAddress");
    }
  }, [isConnected, address]);

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
      setWalletAddress(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null); // Clear blockchainWallet on disconnect
      Cookies.remove("walletAddress");
      Cookies.remove("accountIdentifier");
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
            blockchainWallet, // Included in the context
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
