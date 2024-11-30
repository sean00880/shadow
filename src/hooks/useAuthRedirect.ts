"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "./useUserProfile";

export const useRedirects = () => {
  const { profile, loading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only apply redirection logic in `/auth` directory and subdirectories
    if (!pathname.startsWith("/auth")) return;

    const redirectLogic = async () => {
      if (loading) return; // Wait for profile to finish loading

      if (!profile) {
        console.log("No profile found. Redirecting...");
        router.replace("/auth/create-profile");
        return;
      }

      console.log("Profile found. Redirecting to /auth/overview");
      router.replace("/auth/overview");
    };

    redirectLogic();
  }, [pathname, profile, loading, router]);
};
