"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useReducer,
  useCallback,
  useRef,
} from "react";
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

// Auth Context Types
export interface AuthContextType {
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
  fetchProfiles: (accountIdentifier: string) => Promise<Profile[]>;
  logoutProfile: () => void;
}

interface AuthState {
  profiles: Profile[];
  activeProfile: Profile | null;
  walletAddress: string | null;
  accountIdentifier: string | null;
  activeWallet: string | null;
}

interface AuthAction {
  type:
    | "SET_PROFILES"
    | "SET_ACTIVE_PROFILE"
    | "SET_WALLET_ADDRESS"
    | "SET_ACCOUNT_IDENTIFIER"
    | "SET_ACTIVE_WALLET"
    | "RESET_AUTH";
  payload?: Profile[] | Profile | string | null;
}

const initialState: AuthState = {
  profiles: [],
  activeProfile: null,
  walletAddress: null,
  accountIdentifier: null,
  activeWallet: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local Storage Helper
const storageHelper = {
  get: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear: (key: string) => {
    localStorage.removeItem(key);
  },
};

// Reducer Function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_PROFILES":
      return { ...state, profiles: action.payload as Profile[] };
    case "SET_ACTIVE_PROFILE":
      return { ...state, activeProfile: action.payload as Profile };
    case "SET_WALLET_ADDRESS":
      return { ...state, walletAddress: action.payload as string };
    case "SET_ACCOUNT_IDENTIFIER":
      return { ...state, accountIdentifier: action.payload as string };
    case "SET_ACTIVE_WALLET":
      return { ...state, activeWallet: action.payload as string };
    case "RESET_AUTH":
      return initialState;
    default:
      return state;
  }
}

export const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < 3600000; // 1 hour
};


// AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [state, dispatch] = useReducer(authReducer, initialState);
  const profileCache = useRef<Map<string, { data: Profile[]; timestamp: number }>>(new Map());

  const handleConnect = async (connector: Connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const generateAccountIdentifier = useCallback(
    () => `user-${crypto.randomUUID()}`,
    []
  );

  
  const fetchProfiles = useCallback(async (identifier: string): Promise<Profile[]> => {
    const cached = profileCache.current.get(identifier);
    if (cached && isCacheValid(cached.timestamp)) {
      dispatch({ type: "SET_PROFILES", payload: cached.data });
      dispatch({ type: "SET_ACTIVE_PROFILE", payload: cached.data[0] || null });
      return cached.data;
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("account_identifier", identifier);
    if (error) {
      console.error("Error fetching profiles:", error.message);
      dispatch({ type: "SET_PROFILES", payload: [] });
      dispatch({ type: "SET_ACTIVE_PROFILE", payload: null });
      return [];
    }

    profileCache.current.set(identifier, { data, timestamp: Date.now() });
    dispatch({ type: "SET_PROFILES", payload: data });
    dispatch({ type: "SET_ACTIVE_PROFILE", payload: data[0] || null });
    return data || [];
  }, []);

  const logoutProfile = useCallback(() => {
    dispatch({ type: "RESET_AUTH" });
    profileCache.current.clear();
    ["walletAddress", "accountIdentifier", "profiles", "activeWallet", "activeProfile"].forEach(storageHelper.clear);
    ["walletAddress", "accountIdentifier"].forEach((key) => Cookies.remove(key));
  }, []);

  useEffect(() => {
    const cachedProfiles = storageHelper.get("profiles");
    const cachedActiveProfile = storageHelper.get("activeProfile");
    const cachedWalletAddress = storageHelper.get("walletAddress");
    const cachedAccountIdentifier = storageHelper.get("accountIdentifier");

    if (cachedProfiles) dispatch({ type: "SET_PROFILES", payload: cachedProfiles });
    if (cachedActiveProfile) dispatch({ type: "SET_ACTIVE_PROFILE", payload: cachedActiveProfile });
    if (cachedWalletAddress) dispatch({ type: "SET_WALLET_ADDRESS", payload: cachedWalletAddress });
    if (cachedAccountIdentifier) dispatch({ type: "SET_ACCOUNT_IDENTIFIER", payload: cachedAccountIdentifier });
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      const userId = Cookies.get("accountIdentifier") || generateAccountIdentifier();
      Cookies.set("accountIdentifier", userId, { path: "/", expires: 7 });
      Cookies.set("walletAddress", address, { path: "/", expires: 7 });

      dispatch({ type: "SET_ACCOUNT_IDENTIFIER", payload: userId });
      dispatch({ type: "SET_WALLET_ADDRESS", payload: address });
      fetchProfiles(userId);
    }
  }, [isConnected, address, generateAccountIdentifier, fetchProfiles]);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            walletAddress: state.walletAddress,
            accountIdentifier: state.accountIdentifier,
            blockchainWallet: caipAddress || null,
            profiles: state.profiles,
            activeWallet: state.activeWallet,
            activeProfile: state.activeProfile,
            setActiveWallet: (wallet) => dispatch({ type: "SET_ACTIVE_WALLET", payload: wallet }),
            switchProfile: (wallet) => {
              const selectedProfile = state.profiles.find((p) => p.walletAddress === wallet);
              if (!selectedProfile) {
                console.error("Cannot switch to a non-existent profile:", wallet);
                return;
              }
              dispatch({ type: "SET_ACTIVE_WALLET", payload: wallet });
              dispatch({ type: "SET_ACTIVE_PROFILE", payload: selectedProfile });
              storageHelper.set("activeWallet", wallet);
              storageHelper.set("activeProfile", selectedProfile);
            },
            connect: handleConnect,
            disconnect: async () => {
              logoutProfile();
              await wagmiDisconnect();
            },
            connectors,
            fetchProfiles,
            logoutProfile,
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// useAuthContext Hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
