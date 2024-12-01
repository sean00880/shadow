"use client";

import { useAuthContext, isCacheValid } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { handleError } from "../utils/errorHandler"; // Centralized error handling utility

export const useUserProfile = () => {
  const { walletAddress, activeProfile, fetchProfiles, accountIdentifier } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(activeProfile);

  useEffect(() => {
    const loadProfile = async () => {
      if (!walletAddress || !accountIdentifier || profile) return; // Exit early if conditions are met

      setLoading(true);

      try {
        // Check sessionStorage for cached profiles
        const cachedProfiles = sessionStorage.getItem(`profiles-${accountIdentifier}`);
        if (cachedProfiles) {
          const parsedProfiles = JSON.parse(cachedProfiles);
          if (isCacheValid(parsedProfiles.timestamp)) {
            setProfile(parsedProfiles.data[0]); // Use cached profile if valid
            setLoading(false);
            return;
          }
        }

        // Fetch profiles from the server if cache is invalid
        const fetchedProfiles = await fetchProfiles(accountIdentifier);
        if (fetchedProfiles.length > 0) {
          setProfile(fetchedProfiles[0]); // Automatically use the first profile
          sessionStorage.setItem(
            `profiles-${accountIdentifier}`,
            JSON.stringify({ data: fetchedProfiles, timestamp: Date.now() })
          );
        }
      } catch (error) {
        console.error("Error loading profile:", handleError(error)); // Use centralized error handling
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [walletAddress, accountIdentifier, profile, fetchProfiles]);

  return { profile, loading };
};
