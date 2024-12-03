"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Connector, useConnect, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import Cookies from "js-cookie";
import { wagmiAdapter, projectId } from "../lib/config";

// Utility function to safely get cookie values
const getCookieValue = (key: string): string | null => {
  const value = Cookies.get(key);
  return value !== undefined ? value : null;
};

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
  isConnected: boolean; // Track connection status
  connect: (options: { connector: Connector; chainId?: number }) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    typeof window !== "undefined" ? getCookieValue("walletAddress") : null
  );
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(() =>
    typeof window !== "undefined" ? getCookieValue("accountIdentifier") : null
  );
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);

  // Handle wallet connection
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

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    console.log("Disconnecting wallet...");
    try {
      await wagmiDisconnect();
      setWalletAddress(null);
      setAccountIdentifier(null);
      setBlockchainWallet(null);
      Cookies.remove("walletAddress");
      Cookies.remove("accountIdentifier");
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
    }
  };

  // Update state and cookies when wallet connects
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

  // Restore cached wallet state on mount
  useEffect(() => {
    if (!walletAddress) {
      const cachedWalletAddress = getCookieValue("walletAddress");
      if (cachedWalletAddress) setWalletAddress(cachedWalletAddress);
    }
    if (!accountIdentifier) {
      const cachedAccountIdentifier = getCookieValue("accountIdentifier");
      if (cachedAccountIdentifier) setAccountIdentifier(cachedAccountIdentifier);
    }
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
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
