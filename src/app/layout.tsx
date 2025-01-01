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
  { title: "How FUCKCOIN Disrupts the Solana Ecosystem", href: "/blog/fuckcoin-solana" },
  { title: "The No-Tax Revolution of FUCKCOIN", href: "/blog/no-tax-revolution" },
  { title: "Why Burned Liquidity Matters for Memes", href: "/blog/burned-liquidity" },
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
        <title>FUCKCOIN - $FCK on Solana</title>
        <meta
          name="description"
          content="Meet FUCKCOIN on Solana: The most explosive, community-driven DeFi meme project designed to burn the old rules and create something raw and unapologetic."
        />
        <meta
          name="keywords"
          content="FUCKCOIN, $FCK, Solana, DeFi, meme coin, no-tax crypto, Solana memes, crypto innovation"
        />
        <meta name="author" content="FUCKCOIN Team" />
        <meta property="og:title" content="FUCKCOIN - $FCK on Solana" />
        <meta
          property="og:description"
          content="Meet FUCKCOIN on Solana: The most explosive, community-driven DeFi meme project designed to burn the old rules and create something raw and unapologetic."
        />
        <meta property="og:image" content="/images/fuckcoin-solana.png" />
        <meta property="og:url" content="https://fuckcoinonsol.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FUCKCOIN - $FCK on Solana" />
        <meta
          name="twitter:description"
          content="Meet FUCKCOIN on Solana: The most explosive, community-driven DeFi meme project designed to burn the old rules and create something raw and unapologetic."
        />
        <meta name="twitter:image" content="/images/fuckcoin-solana.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
