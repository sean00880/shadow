"use client";

import { useRedirects } from "../../hooks/useAuthRedirect";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useRedirects(); // This applies the redirection logic to the entire `/auth` directory and its subroutes.

  return <>{children}</>;
}
