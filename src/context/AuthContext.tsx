"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { mainnet, sepolia, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import Cookies from "js-cookie";
import {
  createConfig,
  http,
  cookieStorage,
  createStorage,
} from "wagmi";
import { wagmiAdapter, projectId } from "../lib/config";

// Function to create Wagmi config
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

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

const queryClient = new QueryClient();

export interface AuthContextType {
  walletAddress: string | null;
  accountIdentifier: string | null;
  blockchainWallet: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: (options: { connector: Connector; chainId?: number }) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
  setAccountIdentifier: (accountIdentifier: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => Cookies.get("walletAddress") || null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(
    () => Cookies.get("accountIdentifier") || null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);

  // Set and restore connection state from localStorage
  useEffect(() => {
    const state = localStorage.getItem("walletConnectState") || "";
    if (!isConnected && state === "true") {
      const connector = connectors[0];
      connect({ connector });
    }
  }, [isConnected, connect, connectors]);

  useEffect(() => {
    localStorage.setItem("walletConnectState", isConnected.toString());
  }, [isConnected]);

  const handleConnect = async (options: { connector: Connector; chainId?: number }) => {
    setIsConnecting(true);
    try {
      await connect(options);
      console.log("Wallet connected successfully:", options.connector.name);
    } catch (error) {
      console.error("Error during wallet connection:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    console.log("Disconnecting wallet...");
    try {
      await wagmiDisconnect();
      setWalletAddress(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null);
      Cookies.remove("walletAddress");
      Cookies.remove("accountIdentifier");
      localStorage.removeItem("walletConnectState");
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      Cookies.set("walletAddress", address, { expires: 7 });

      if (!accountIdentifier) {
        const generatedAccountId = `user-${crypto.randomUUID()}`;
        setAccountIdentifier(generatedAccountId);
        Cookies.set("accountIdentifier", generatedAccountId, { expires: 7 });
      }

      const chainId = caipAddress?.split(":")[1] || null;
      setBlockchainWallet(`${chainId}:${address}`);
    }
  }, [isConnected, address, caipAddress, accountIdentifier]);

  const [config2] = useState(() => wagmiConfig());
  return (
    <WagmiProvider config={config2}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            walletAddress,
            accountIdentifier,
            blockchainWallet,
            isConnected,
            disconnect: handleDisconnect,
            connectors,
            connect: handleConnect,
            isConnecting,
            setAccountIdentifier,
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
