"use client";

import React, { useState, ReactNode } from "react";
import { Provider } from "urql";
import { client } from "../lib/urql";
import localFont from "next/font/local";
import "./globals.css";
import { usePathname } from "next/navigation";
import DefaultLayout from "../components/DefaultLayout";
import DocumentationLayout from "../components/DocumentationLayout";
import DocumentationLayout2 from "../components/DocumentationLayout2";
import { AuthProvider } from "../context/AuthContext";
import { ProfileProvider } from "../context/ProfileContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { wagmiConfig } from "../context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const queryClient = new QueryClient();

const posts = [
  { title: "How MemeLinked Integrates DeFi and Social Networking", href: "/blog/defi-social-networking" },
  { title: "GameFi’s Role in the MemeLinked Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Future of Meme-Driven Finance", href: "/blog/meme-finance-future" },
];

interface RootLayoutClientProps {
  children: ReactNode;
  initialState: State | undefined;
}

export default function RootLayoutClient({ children, initialState }: RootLayoutClientProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isDocumentationPage = pathname.startsWith("/docs");
  const isBlogPage = pathname.startsWith("/blog");

  return (
    <WagmiProvider config={wagmiConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <Provider value={client}>
          <AuthProvider>
            <ProfileProvider>
              <html lang="en">
                <head>
                  <meta charSet="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>MemeLinked</title>
                </head>
                <body
                  className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
                >
                  {isLandingPage ? (
                    children
                  ) : isDocumentationPage ? (
                    <DocumentationLayout2 posts={posts}>{children}</DocumentationLayout2>
                  ) : isBlogPage ? (
                    <DocumentationLayout posts={posts}>{children}</DocumentationLayout>
                  ) : (
                    <DefaultLayout>{children}</DefaultLayout>
                  )}
                </body>
              </html>
            </ProfileProvider>
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
