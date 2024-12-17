"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import { createAppKit } from "@reown/appkit";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, base, bsc } from "wagmi/chains";

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

// Profile schema fields
export interface Profile {
  id: string;
  display_name: string;
  username: string;
  about: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  wallet_address: string;
  account_identifier: string;
  membership_tier: string | null;
  profile_type: string | null;
  role: string | null;
  email?: string;
  links?: string[];
}

interface AuthContextType {
  walletAddress: string | null;
  activeProfile: Profile | null;
  isConnected: boolean;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  /**
   * Authenticate user with Supabase using wallet address.
   */
  const authenticateUser = useCallback(async (walletAddress: string, username: string) => {
    const email = `${username}@yourdomain.com`;
    const password = walletAddress;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Authentication error:", error.message);
      throw new Error("Supabase authentication failed.");
    }
    console.log("User authenticated successfully.");
  }, []);

  /**
   * Fetch profile for the connected wallet.
   */
  const fetchProfile = useCallback(async () => {
    if (!address) {
      console.warn("No wallet connected.");
      setActiveProfile(null);
      return;
    }

    try {
      console.log("Authenticating and fetching profile for wallet:", address);

      // Step 1: Check for existing Supabase session and user metadata
      const { data: session, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        console.error("Error fetching Supabase session:", sessionError);
      }

      const metadata = session?.user?.user_metadata;
      if (metadata?.wallet_address === address) {
        console.log("Using metadata for profile.");
        setActiveProfile(metadata as Profile);
        localStorage.setItem("activeProfile", JSON.stringify(metadata));
        return;
      }

      // Step 2: Fetch profile from database as fallback
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (error || !profile) {
        console.warn("No profile found for wallet:", address);
        setActiveProfile(null);
        localStorage.removeItem("activeProfile");
        return;
      }

      console.log("Profile fetched:", profile);

      // Step 3: Authenticate user
      await authenticateUser(address, profile.username);

      // Step 4: Update user metadata
      await supabase.auth.updateUser({ data: { ...profile } });

      // Step 5: Set activeProfile and cache it
      setActiveProfile(profile);
      localStorage.setItem("activeProfile", JSON.stringify(profile));
      console.log("Profile and metadata updated successfully.");
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  }, [address, authenticateUser]);

  /**
   * Initialize profile from localStorage or fetch it on wallet connection.
   */
  useEffect(() => {
    // Load cached profile from localStorage
    const cachedProfile = localStorage.getItem("activeProfile");
    if (cachedProfile) {
      console.log("Loaded activeProfile from localStorage.");
      setActiveProfile(JSON.parse(cachedProfile));
    }

    // Fetch profile if wallet is connected
    if (address) {
      console.log("Wallet address detected. Reinitializing profile...");
      fetchProfile();
    }
  }, [address, fetchProfile]);

  /**
   * Logout handler: Clears all states, cached data, and disconnects wallet.
   */
  const logout = useCallback(async () => {
    console.log("Logging out...");

    try {
      // Step 1: Sign out from Supabase
      await supabase.auth.signOut();
      await disconnect();
      // Step 2: Clear all cached data and reset states
      localStorage.removeItem("activeProfile");
      setActiveProfile(null);
      localStorage.clear();
 
      // Step 3: Disconnect wallet

      console.log("Logout complete. State and cache cleared.");
    } catch (error) {
      console.error("Error during logout:", error);
    }

    window.location.reload(); // Refresh the page to clear any cached data
  
  }, [disconnect]);

  return (
    <AuthContext.Provider
      value={{
        walletAddress: address || null,
        activeProfile,
        isConnected: !!address,
        fetchProfile,
        logout,
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
