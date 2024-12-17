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
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  /**
   * Fetch profile for connected wallet
   */
  const fetchProfile = useCallback(async () => {
    if (!address) return;

    try {
      console.log("Fetching profile for wallet:", address);

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

      console.log("Profile fetched successfully:", profile);

      const email = `${profile.username}@yourdomain.com`;
      const password = address;

      // Authenticate user
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        console.error("Authentication error:", authError);
        return;
      }

      console.log("User authenticated successfully.");
      setActiveProfile(profile);
      localStorage.setItem("activeProfile", JSON.stringify(profile));
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  }, [address]);

  /**
   * Initialize profile from localStorage and wallet address.
   */
  useEffect(() => {
    // Load cached profile immediately
    const cachedProfile = localStorage.getItem("activeProfile");
    if (cachedProfile) {
      console.log("Loaded activeProfile from localStorage.");
      setActiveProfile(JSON.parse(cachedProfile));
    }

    // Fetch profile if wallet address exists
    if (address) {
      console.log("Wallet address detected. Validating profile...");
      fetchProfile();
    }
  }, [address, fetchProfile]);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    console.log("Logging out...");

    try {
      await supabase.auth.signOut();
      localStorage.removeItem("activeProfile");
      setActiveProfile(null);
      await disconnect();
      console.log("Logout complete. States and cache cleared.");
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
