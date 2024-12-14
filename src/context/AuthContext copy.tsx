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
import debounce from "lodash.debounce";
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
  
  

  // Helper function to get cached profiles
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

  // Fetch profiles and update state
  const fetchProfiles = useCallback(
    async (wallet: string | null) => {
      if (!wallet) return;

      const cachedData = getCachedProfiles(wallet);
      if (cachedData) {
        setProfiles(cachedData.profiles || []);
        setAccountIdentifier(cachedData.accountIdentifier || null);

        // Set active profile from cache
        const activeProfileId = localStorage.getItem("activeProfileId");
        const activeProfile =
  cachedData.profiles?.find((profile: Profile) => profile.id === activeProfileId) ||
  cachedData.profiles?.[0];

        setActiveProfile(activeProfile || null);
        return; // Avoid refetching if cache is valid
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

          // Set active profile
          const activeProfileId = localStorage.getItem("activeProfileId");
          const activeProfile = data.find((profile) => profile.id === activeProfileId) || data[0];
          setActiveProfile(activeProfile);

          // Cache data
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

  // Preload cached active profile on initial render
  useEffect(() => {
    const cachedWallet = localStorage.getItem("walletAddress");
    if (cachedWallet) {
      setWalletAddress(cachedWallet);
      const cachedData = getCachedProfiles(cachedWallet);
      if (cachedData) {
        setProfiles(cachedData.profiles || []);
        setAccountIdentifier(cachedData.accountIdentifier || null);
  
        const activeProfileId = localStorage.getItem("activeProfileId");
        const activeProfile =
          cachedData.profiles?.find((profile: Profile) => profile.id === activeProfileId) ||
          cachedData.profiles?.[0];
  
        setActiveProfile(activeProfile || null);
      }
    }
  }, []);

  const loadFromCache = (address: string | null): boolean => {
    if (!address) return false; // Exit early if no wallet address is provided
  
    const cachedData = getCachedProfiles(address); // Retrieve cached profiles
    if (!cachedData) return false; // Return false if no cached data is found
  
    const activeProfileId = localStorage.getItem("activeProfileId");
    const activeProfile =
      cachedData.profiles?.find((profile: Profile) => profile.id === activeProfileId) ||
      cachedData.profiles?.[0]; // Default to the first profile if no activeProfileId
  
    // Set profiles and active profile without disrupting the wallet connection
    if (cachedData.profiles) {
      setProfiles(cachedData.profiles); // Update profiles state
    }
    if (activeProfile) {
      setActiveProfile(activeProfile); // Update active profile state
      setAccountIdentifier(activeProfile.accountIdentifier || null); // Use accountIdentifier from active profile
    } else {
      setActiveProfile(null); // Clear active profile if none found
      setAccountIdentifier(null); // Clear accountIdentifier
    }
  
    return true; // Return true since cache loading was successful
  };
  


  const loadCachedProfiles = useCallback(async () => {
    if (address && !loadFromCache(address) && isConnected) {
      await fetchProfiles(address);
    }
  }, [address, isConnected, fetchProfiles, loadFromCache]);
  
  
  useEffect(() => {
    let isMounted = true; // Add a flag to prevent unnecessary state updates if unmounted
    const fetchProfilesOnce = async () => {
        if (isMounted) {
            await loadCachedProfiles();
        }
    };

    fetchProfilesOnce();

    return () => {
        isMounted = false; // Cleanup to prevent state updates after unmount
    };
}, [address, isConnected]); // Refine the dependency array

  
  

  const debouncedUpdateWallet = useCallback(
    debounce(async (newAddress: string | null, caip: string | null | undefined) => {
      if (!newAddress) return;
  
      setWalletAddress(newAddress);
      setBlockchainWallet(caip || null);
  
      if (!loadFromCache(newAddress)) {
        await fetchProfiles(newAddress); // Fetch only if cache is invalid
      }
    }, 300),
    [fetchProfiles, loadFromCache]
  );
  

  
  // Handle wallet connection changes
  useEffect(() => {
    if (address) {
      debouncedUpdateWallet(address, caipAddress);
  

    }
  }, [isConnected, address, caipAddress, debouncedUpdateWallet]);
  

  // Update wallet address and profiles when address changes
  useEffect(() => {
    if (address) {
      fetchProfiles(address);
    }
  }, [isConnected, address, fetchProfiles]);

  // Switch profile

  const switchProfile = useCallback(async (profileId: string) => {
    setIsSwitchingProfile(true);
    try {
      const selectedProfile = profiles.find((profile) => profile.id === profileId);
      if (selectedProfile) {
        setActiveProfile(selectedProfile);
  
        // Cache only the activeProfileId in local storage
        localStorage.setItem("activeProfileId", profileId);
      }
    } catch (error) {
      console.error("Error switching profiles:", error);
    } finally {
      setIsSwitchingProfile(false);
    }
  }, [profiles]);

  const { disconnect } = useDisconnect();

  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
  
      // Clear localStorage
      localStorage.clear();
      setWalletAddress(null);
      setBlockchainWallet(null);
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
  
      // Disconnect from wagmi and AppKit
      await appKit.adapter?.connectionControllerClient?.disconnect();
      await disconnect(); // Ensure wagmi also disconnects
      
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [disconnect]);
  
  
  


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
      logout, // Ensure this is included
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