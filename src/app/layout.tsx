import React, { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";

import { headers } from "next/headers"; // Use headers for server-side operations
import LayoutContent from "./LayoutContent";

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

const posts = [
  { title: "How Shadow the Hedgehog Reshapes Meme Utility", href: "/blog/meme-utility" },
  { title: "GameFi’s Role in the MSI Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Resilience of Shadow the Hedgehog", href: "/blog/community-resilience" },
];

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersData = await headers(); // Resolve the promise
  const cookies = headersData.get("cookie") || ""; // Safely retrieve cookies;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shadow the Hedgehog - $SHADOW on Sonic Chain</title>
        <meta name="description" content="Discover Shadow the Hedgehog, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
        <meta name="keywords" content="Shadow the Hedgehog, DeFi, meme coin, crypto innovation, community-driven crypto" />
        <meta name="author" content="Shadow the Hedgehog Team" />
        <meta property="og:title" content="Shadow the Hedgehog - $SHADOW on Sonic Chain" />
        <meta property="og:description" content="Discover Shadow the Hedgehog, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
        <meta property="og:image" content="/images/MSIonSOL.png" />
        <meta property="og:url" content="https://monkeysolinu.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shadow the Hedgehog - $SHADOW on Sonic Chain" />
        <meta name="twitter:description" content="Discover Shadow the Hedgehog, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
        <meta name="twitter:image" content="/images/MSIonSOL.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
