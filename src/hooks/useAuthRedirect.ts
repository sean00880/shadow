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
    if (loading) return; // Wait for loading to complete before redirect logic

    if (!walletAddress && pathname !== "/auth/connect") {
      console.log("Redirecting to /auth/connect...");
      router.replace("/auth/connect");
    } else if (walletAddress && !profile && pathname !== "/auth/create-profile") {
      console.log("Redirecting to /auth/create-profile...");
      router.replace("/auth/create-profile");
    } else if (profile && pathname.startsWith("/auth") && pathname !== "/auth/overview") {
      console.log("Redirecting to /auth/overview...");
      router.replace("/auth/overview");
    }
  }, [walletAddress, profile, loading, pathname, router]);
};
