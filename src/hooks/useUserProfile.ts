"use client";

import { useAuthContext, isCacheValid } from "../context/AuthContext";
import { useEffect, useState } from "react";

export const useUserProfile = () => {
  const { walletAddress, activeProfile, fetchProfiles, accountIdentifier } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(activeProfile);

  useEffect(() => {
    if (!walletAddress || !accountIdentifier || profile) return; // Avoid unnecessary fetches

    const loadProfile = async () => {
      setLoading(true);

      try {
        const cachedProfiles = sessionStorage.getItem(`profiles-${accountIdentifier}`);
        if (cachedProfiles) {
          const parsedProfiles = JSON.parse(cachedProfiles);
          if (isCacheValid(parsedProfiles.timestamp)) {
            setProfile(parsedProfiles.data[0]); // Use cached profile
            setLoading(false);
            return;
          }
        }

        // Only fetch if cache is invalid or unavailable
        const fetchedProfiles = await fetchProfiles(accountIdentifier);
        if (fetchedProfiles.length > 0) {
          setProfile(fetchedProfiles[0]);
          sessionStorage.setItem(
            `profiles-${accountIdentifier}`,
            JSON.stringify({ data: fetchedProfiles, timestamp: Date.now() })
          );
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [walletAddress, accountIdentifier, profile, fetchProfiles]);

  return { profile, loading };
};
