"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import { useUserProfile } from "./useUserProfile";

export const useAuthRedirect = () => {
  const { walletAddress, accountIdentifier } = useAuthContext();
  const { profile, loading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectLogic = () => {
      // Wait for wallet and profile data to load
      if (loading) return;

      // Redirect based on wallet and profile status
      if (!walletAddress) {
        console.log("No wallet connected. Redirecting to /auth/connect...");
        if (pathname !== "/auth/connect") router.replace("/auth/connect");
      } else if (!profile && accountIdentifier) {
        console.log("No profile found. Redirecting to /auth/create-profile...");
        if (pathname !== "/auth/create-profile") router.replace("/auth/create-profile");
      } else if (pathname.startsWith("/auth") && profile) {
        console.log("Profile found. Redirecting to /auth/overview...");
        if (pathname !== "/auth/overview") router.replace("/auth/overview");
      }
    };

    redirectLogic();
  }, [walletAddress, profile, loading, pathname, router, accountIdentifier]);
};
