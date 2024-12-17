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
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, bsc, base } from "wagmi/chains";
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
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(null);
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState<boolean>(false);

  // OPTIONAL: Only run once, if needed.
  useEffect(() => {
    assignCredentials();
  }, []);

  const assignCredentials = useCallback(async () => {
    try {
      // Fetch all profiles from the Supabase "profiles" table
      const { data: profiles, error } = await supabase.from("profiles").select("*");
  
      if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
      }
  
      if (!profiles || profiles.length === 0) {
        console.log("No profiles found.");
        return;
      }
  
      for (const profile of profiles) {
        // Generate email and password for the profile
        const email = `${profile.username}@yourdomain.com`;
        const password = `${profile.wallet_address}-${profile.username}`;
  
        try {
          // Sign up user in Supabase Auth
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { profile_id: profile.id }, // Metadata field moved into `options`
            },
          });
  
          // Handle any sign-up errors
          if (signUpError) {
            if (!signUpError.message.includes("User already registered")) {
              console.error(`Error signing up user for profile ${profile.id}:`, signUpError.message);
            } else {
              console.log(`User already registered for profile ${profile.id}`);
            }
          } else {
            console.log(`User signed up successfully for profile ${profile.id}`);
          }
        } catch (innerError) {
          console.error(`Error during sign-up process for profile ${profile.id}:`, innerError);
        }
      }
  
      console.log("Credentials assigned successfully.");
    } catch (outerError) {
      if (outerError instanceof Error) {
        console.error("Error assigning credentials:", outerError.message);
      } else {
        console.error("Unknown error occurred while assigning credentials:", outerError);
      }
    }
  }, []);
  const getCachedProfiles = (address: string | null) => {
    if (!address) return null;
    const cachedProfiles = localStorage.getItem(`profiles_${address}`);
    const cachedAccountIdentifier = localStorage.getItem("accountIdentifier");
    const cachedTimestamp = localStorage.getItem(`profiles_${address}_timestamp`);
    const isCacheValid = cachedTimestamp && Date.now() - parseInt(cachedTimestamp) < 1000 * 60 * 60 * 24;
  
    if (cachedProfiles && cachedAccountIdentifier && isCacheValid) {
      return {
        profiles: JSON.parse(cachedProfiles),
        accountIdentifier: cachedAccountIdentifier,
      };
    }
    return null;
  };
  

  const fetchProfiles = useCallback(
    async (wallet: string | null) => {
      if (!wallet) return;

      const cachedData = getCachedProfiles(wallet);
      if (cachedData) {
        setProfiles(cachedData.profiles || []);
        setAccountIdentifier(cachedData.accountIdentifier || null);

        const activeProfileId = localStorage.getItem("activeProfileId");
        const activeProfile =
          cachedData.profiles?.find((profile: Profile) => profile.id === activeProfileId) ||
          cachedData.profiles?.[0];

        setActiveProfile(activeProfile || null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);

        if (error) throw new Error(error.message);

        if (data?.length) {
          setProfiles(data);
          setAccountIdentifier(data[0].accountIdentifier);

          const activeProfileId = localStorage.getItem("activeProfileId");
          const activeProfile = data.find((p) => p.id === activeProfileId) || data[0];
          setActiveProfile(activeProfile);

          localStorage.setItem(`profiles_${wallet}`, JSON.stringify(data));
          localStorage.setItem("accountIdentifier", data[0].accountIdentifier);
          localStorage.setItem(`profiles_${wallet}_timestamp`, Date.now().toString());
        } else {
          setProfiles([]);
          setActiveProfile(null);
          setAccountIdentifier(null);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [setProfiles, setActiveProfile, setAccountIdentifier]
  );

  // Single effect to manage state based on `address`.
  useEffect(() => {
    if (address) {
      // Wallet connected or restored
      setWalletAddress(address);
      setBlockchainWallet(caipAddress || null);

      // Attempt to load or fetch profiles
      const cachedLoaded = getCachedProfiles(address);
      if (cachedLoaded) {
        // If loaded from cache
        setProfiles(cachedLoaded.profiles || []);
        setAccountIdentifier(cachedLoaded.accountIdentifier || null);

        const activeProfileId = localStorage.getItem("activeProfileId");
        const activeProfile =
          cachedLoaded.profiles?.find((p: Profile) => p.id === activeProfileId) ||
          cachedLoaded.profiles?.[0];

        setActiveProfile(activeProfile || null);
      } else {
        // No cache, fetch from supabase
        fetchProfiles(address);
      }
    } else {
      // Address is null, user disconnected
      setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
    }
  }, [address, caipAddress, fetchProfiles]);

  const switchProfile = useCallback(
    async (profileId: string) => {
      setIsSwitchingProfile(true);
      try {
        const selectedProfile = profiles.find((p) => p.id === profileId);
        if (selectedProfile) {
          setActiveProfile(selectedProfile);
          localStorage.setItem("activeProfileId", profileId);
        }
      } catch (error) {
        console.error("Error switching profiles:", error);
      } finally {
        setIsSwitchingProfile(false);
      }
    },
    [profiles]
  );
  const logout = useCallback(async () => {
    
    
    localStorage.clear();
    console.log("Local storage cleared");
     // Call your disconnect method (if applicable)
     setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
  
     appKit.adapter?.connectionControllerClient?.disconnect();
     await supabase.auth.signOut();
  }, []);
  

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
        fetchProfiles,
        logout,
        connect: async (connector: Connector) => await connect({ connector }),
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
