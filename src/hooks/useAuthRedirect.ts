"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";

export const useRedirects = () => {
  const { walletAddress, profiles, fetchProfiles, accountIdentifier } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only apply redirection logic in `/auth` directory and subdirectories
    if (!pathname.startsWith("/auth")) return;

    const redirectLogic = async () => {
      console.log("Checking wallet connection and profile status...");
    
      if (!walletAddress) {
        console.log("No wallet connected. Redirecting to /auth/connect");
        router.replace("/auth/connect");
        return;
      }
    
      if (accountIdentifier && profiles.length === 0) {
        console.log("Fetching profiles for account identifier:", accountIdentifier);
        await fetchProfiles(accountIdentifier);
      }
    
      if (profiles.length === 0) {
        console.log("No profiles found. Redirecting to /auth/create-profile");
        router.replace("/auth/create-profile");
      } else {
        console.log("Profile found. Redirecting to /auth/overview");
        router.replace("/auth/overview");
      }
    };
    

    redirectLogic();
  }, [walletAddress, profiles, pathname, accountIdentifier, fetchProfiles, router]);
};
