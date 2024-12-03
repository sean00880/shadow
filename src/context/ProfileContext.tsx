"use client";

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../utils/supaBaseClient";
import Cookies from "js-cookie";
import { useAuthContext } from "./AuthContext";

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
  shortId?: string;
  linked?: string[];
  links?: string[];
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoadingProfile: boolean;
  accountIdentifier: string | null;
  fetchProfiles: () => Promise<void>;
  switchProfile: (profileId: string) => void;
  clearProfileState: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { walletAddress, accountIdentifier, setAccountIdentifier, isConnected } = useAuthContext();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Debounce wallet updates to prevent unnecessary fetches
  const [debouncedWalletAddress, setDebouncedWalletAddress] = useState(walletAddress);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWalletAddress(walletAddress), 250); // 250ms debounce
    return () => clearTimeout(timer);
  }, [walletAddress]);

  const fetchProfiles = useCallback(async () => {
    if (!debouncedWalletAddress) {
      console.log("No wallet connected. Skipping profile fetching...");
      setProfiles([]);
      setActiveProfile(null);
      return;
    }

    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", debouncedWalletAddress);

      if (error) throw new Error(error.message);

      if (data?.length) {
        console.log("Profiles fetched successfully:", data);
        setProfiles(data);

        const defaultProfile = data[0];
        setActiveProfile(defaultProfile);
        setAccountIdentifier(defaultProfile.accountIdentifier);

        // Cache profiles
        localStorage.setItem(`profiles_${debouncedWalletAddress}`, JSON.stringify(data));
        localStorage.setItem("activeProfile", JSON.stringify(defaultProfile));
        Cookies.set("accountIdentifier", defaultProfile.accountIdentifier, { expires: 7 });
      } else {
        console.log("No profiles found for the connected wallet.");
        setProfiles([]);
        setActiveProfile(null);

        // Generate a fallback accountIdentifier if none exists
        if (!accountIdentifier) {
          const generatedAccountId = `user-${crypto.randomUUID()}`;
          setAccountIdentifier(generatedAccountId);
          Cookies.set("accountIdentifier", generatedAccountId, { expires: 7 });
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [debouncedWalletAddress, accountIdentifier, setAccountIdentifier]);

  const switchProfile = useCallback(
    (profileId: string) => {
      const selectedProfile = profiles.find((profile) => profile.id === profileId);
      if (selectedProfile) {
        setActiveProfile(selectedProfile);
        setAccountIdentifier(selectedProfile.accountIdentifier);
        localStorage.setItem("activeProfile", JSON.stringify(selectedProfile));
        Cookies.set("accountIdentifier", selectedProfile.accountIdentifier, { expires: 7 });
        console.log("Switched to profile:", selectedProfile);
      } else {
        console.error("Profile with the given ID not found:", profileId);
      }
    },
    [profiles, setAccountIdentifier]
  );

  const clearProfileState = useCallback(() => {
    setProfiles([]);
    setActiveProfile(null);
    setAccountIdentifier(null);
    localStorage.removeItem("activeProfile");
    Cookies.remove("accountIdentifier");
    console.log("Profile state cleared.");
  }, [setAccountIdentifier]);

  useEffect(() => {
    if (isConnected && debouncedWalletAddress) {
      fetchProfiles();
    } else {
      clearProfileState();
    }
  }, [isConnected, debouncedWalletAddress, fetchProfiles, clearProfileState]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLoadingProfile,
        fetchProfiles,
        switchProfile,
        clearProfileState,
        accountIdentifier,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};
