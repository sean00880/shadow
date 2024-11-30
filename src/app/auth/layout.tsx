"use client";

import React from "react";
import { useRedirects } from "../../hooks/useAuthRedirect";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useRedirects(); // Redirection logic for `/auth`

  return <>{children}</>;
}
