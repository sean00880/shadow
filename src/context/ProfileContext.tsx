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
  password?: string;
  shortId?: string;
  linked?: string[];
  links?: string[];
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  accountIdentifier: string | null; // Reflected from AuthContext
  isLoadingProfile: boolean;
  fetchProfiles: () => Promise<void>;
  switchProfile: (profileId: string) => void;
  clearProfileState: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const {
    walletAddress,
    isConnected,
    accountIdentifier,
    setAccountIdentifier, // Ensure this is added to AuthContext
  } = useAuthContext();

  const [profiles, setProfiles] = useState<Profile[]>(() =>
    typeof window !== "undefined" && walletAddress
      ? JSON.parse(localStorage.getItem(`profiles_${walletAddress}`) || "[]")
      : []
  );
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() =>
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("activeProfile") || "null")
      : null
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!walletAddress) {
      setProfiles([]);
      setActiveProfile(null);
      setAccountIdentifier(null); // Clear accountIdentifier if wallet is disconnected
      localStorage.removeItem("activeProfile");
      Cookies.remove("accountIdentifier");
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
        setProfiles(data);
        setActiveProfile(data[0]);
        setAccountIdentifier(data[0].accountIdentifier); // Use the value from the profile

        // Cache data in localStorage and cookies
        localStorage.setItem(`profiles_${walletAddress}`, JSON.stringify(data));
        localStorage.setItem("activeProfile", JSON.stringify(data[0]));
        Cookies.set("accountIdentifier", data[0].accountIdentifier, { expires: 7 });
      } else {
        // Generate accountIdentifier if no profile exists
        if (!accountIdentifier) {
          const generatedAccountId = `user-${crypto.randomUUID()}`;
          setAccountIdentifier(generatedAccountId); // Use AuthContext's logic
          Cookies.set("accountIdentifier", generatedAccountId, { expires: 7 });
        }

        setProfiles([]);
        setActiveProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [walletAddress, accountIdentifier, setAccountIdentifier]);

  useEffect(() => {
    if (isConnected) {
      fetchProfiles();
    }
  }, [isConnected, fetchProfiles]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        accountIdentifier, // Expose accountIdentifier here
        isLoadingProfile,
        fetchProfiles,
        switchProfile: (profileId: string) => {
          const selectedProfile = profiles.find((profile) => profile.id === profileId);
          if (selectedProfile) {
            setActiveProfile(selectedProfile);
            setAccountIdentifier(selectedProfile.accountIdentifier); // Reflect accountIdentifier
            localStorage.setItem("activeProfile", JSON.stringify(selectedProfile));
            Cookies.set("accountIdentifier", selectedProfile.accountIdentifier, { expires: 7 });
          }
        },
        clearProfileState: () => {
          setProfiles([]);
          setActiveProfile(null);
          setAccountIdentifier(null);
          localStorage.removeItem("activeProfile");
          Cookies.remove("accountIdentifier");
        },
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
