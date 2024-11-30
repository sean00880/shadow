"use client";

import React from "react";
import { Provider } from "urql";
import { client } from "../lib/urql";
import localFont from "next/font/local";
import "./globals.css";
import { usePathname } from "next/navigation";
import DefaultLayout from "../components/DefaultLayout";
import DocumentationLayout from "../components/DocumentationLayout";
import DocumentationLayout2 from "../components/DocumentationLayout2";
import { AuthProvider } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/config";
import { ReactNode } from "react";
import Cookies from "js-cookie";

// Define local fonts
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

// Create a new instance of QueryClient for TanStack Query
const queryClient = new QueryClient();

// Define the posts array for blog/documentation pages
const posts = [
  { title: "How MemeLinked Integrates DeFi and Social Networking", href: "/blog/defi-social-networking" },
  { title: "GameFi’s Role in the MemeLinked Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Future of Meme-Driven Finance", href: "/blog/meme-finance-future" },
];

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isDocumentationPage = pathname.startsWith("/docs");
  const isBlogPage = pathname.startsWith("/blog");

  // Extract cookies using js-cookie
  const walletCookie = Cookies.get("walletAddress");
  const accountCookie = Cookies.get("accountIdentifier");

  
  const parsedCookies = {
    walletAddress: walletCookie && walletCookie.startsWith("0x") ? walletCookie : null,
    accountIdentifier: accountCookie && accountCookie.startsWith("user-") ? accountCookie : null,
  };
  

  // Log cookies for debugging
  console.log("Parsed Cookies:", parsedCookies);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider value={client}>
          <AuthProvider cookies={parsedCookies}>
            <html lang="en">
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
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}