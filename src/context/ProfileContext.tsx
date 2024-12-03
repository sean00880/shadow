"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
  accountIdentifier: string | null; // Consistent with AuthContext
  fetchProfiles: () => Promise<void>;
  switchProfile: (profileId: string) => void;
  clearProfileState: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const {
    walletAddress,
    accountIdentifier,
    setAccountIdentifier,
    isConnected,
  } = useAuthContext();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch profiles linked to the wallet
  const fetchProfiles = useCallback(async () => {
    if (!walletAddress) {
      console.log("No wallet connected. Skipping fetchProfiles...");
      return;
    }

    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", walletAddress);

      if (error) throw new Error(error.message);

      if (data?.length) {
        console.log("Profiles fetched successfully:", data);
        setProfiles(data);
        const defaultProfile = data[0];
        setActiveProfile(defaultProfile);
        setAccountIdentifier(defaultProfile.accountIdentifier);

        // Cache profiles and active profile in localStorage and Cookies
        localStorage.setItem(`profiles_${walletAddress}`, JSON.stringify(data));
        localStorage.setItem("activeProfile", JSON.stringify(defaultProfile));
        Cookies.set("accountIdentifier", defaultProfile.accountIdentifier, { expires: 7 });
      } else {
        console.log("No profiles found for the connected wallet.");
        setProfiles([]);
        setActiveProfile(null);

        // Generate a new accountIdentifier if no profiles exist
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
  }, [walletAddress, accountIdentifier, setAccountIdentifier]);

  // Handle profile switching
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

  // Clear profile state (e.g., on wallet disconnect)
  const clearProfileState = useCallback(() => {
    if (!isConnected) {
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null);
      localStorage.removeItem("activeProfile");
      Cookies.remove("accountIdentifier");
      console.log("Profile state cleared.");
    }
  }, [isConnected, setAccountIdentifier]);

  // Fetch profiles when the wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchProfiles();
    } else {
      clearProfileState();
    }
  }, [isConnected, walletAddress, fetchProfiles, clearProfileState]);

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
