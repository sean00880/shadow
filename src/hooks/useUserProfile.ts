"use client";

import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";

export const useUserProfile = () => {
  const {
    walletAddress,
    activeProfile,
    fetchProfiles,
    accountIdentifier,
  } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(activeProfile);

  useEffect(() => {
    const loadProfile = async () => {
      if (!walletAddress || !accountIdentifier || profile) return; // Exit early if profile already exists

      setLoading(true);

      try {
        const fetchedProfiles = await fetchProfiles(accountIdentifier);
        if (fetchedProfiles.length > 0) {
          setProfile(fetchedProfiles[0]); // Automatically set the first profile
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [walletAddress, accountIdentifier, profile, fetchProfiles]); // Add `profile` to dependencies to track changes

  return { profile, loading };
};
