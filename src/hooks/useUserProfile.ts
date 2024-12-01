"use client";

import { useAuthContext, isCacheValid } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { handleError } from "../utils/errorHandler" // Centralized error handling utility

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
        // Fetch cached profiles if valid
        const cachedProfiles = sessionStorage.getItem(`profiles-${accountIdentifier}`);
        if (cachedProfiles) {
          const parsedProfiles = JSON.parse(cachedProfiles);
          if (isCacheValid(parsedProfiles.timestamp)) {
            setProfile(parsedProfiles.data[0]); // Use cached profile
            setLoading(false);
            return;
          }
        }

        // Fetch profiles from the server
        const fetchedProfiles = await fetchProfiles(accountIdentifier);
        if (fetchedProfiles.length > 0) {
          setProfile(fetchedProfiles[0]); // Automatically set the first profile
          // Cache the profiles in sessionStorage
          sessionStorage.setItem(
            `profiles-${accountIdentifier}`,
            JSON.stringify({ data: fetchedProfiles, timestamp: Date.now() })
          );
        }
      } catch (error) {
        const message = handleError(error); // Use centralized error handling
        console.error("Error loading profile:", message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [walletAddress, accountIdentifier, profile, fetchProfiles]); // Add `profile` to dependencies to track changes

  return { profile, loading };
};
