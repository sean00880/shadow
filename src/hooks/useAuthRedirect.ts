"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import { useUserProfile } from "./useUserProfile";

export const useAuthRedirect = () => {
  const { walletAddress } = useAuthContext();
  const { profile, loading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectLogic = () => {
      if (loading) return; // Wait for profile loading to finish

      if (!walletAddress) {
        console.log("No wallet connected. Redirecting to /auth/connect...");
        router.replace("/auth/connect");
      } else if (!profile) {
        console.log("No profile found. Redirecting to /auth/create-profile...");
        router.replace("/auth/create-profile");
      } else if (pathname.startsWith("/auth") && profile) {
        console.log("Profile found. Redirecting to /auth/overview...");
        router.replace("/auth/overview");
      }
    };

    redirectLogic();
  }, [walletAddress, profile, loading, pathname, router]);
};
