"use client";

import React from "react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useAuthRedirect(); // Centralized redirection logic

  return <>{children}</>;
}
//better