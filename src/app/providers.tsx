"use client";

import React, { ReactNode, useState } from "react";
import { WagmiProvider, State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as UrqlProvider } from "urql";
import { client as urqlClient } from "../lib/urql";
import { AuthProvider } from "../context/AuthContext";
import { getConfig } from "./config";

type ProvidersProps = {
  children: ReactNode;
  initialState: State | undefined;
};

export function Providers({ children, initialState }: ProvidersProps) {
  // Initialize configurations
  const [wagmiConfig] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <UrqlProvider value={urqlClient}>
          <AuthProvider>{children}</AuthProvider>
        </UrqlProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
