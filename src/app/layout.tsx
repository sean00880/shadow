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
  { title: "How MemeLinked Integrates DeFi and Social Networking", href: "/blog/defi-social-networking" },
  { title: "GameFi’s Role in the MemeLinked Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Future of Meme-Driven Finance", href: "/blog/meme-finance-future" },
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
        <title>Monkey Sol Inu - The Future of Meme and DeFi</title>
        <meta name="description" content="Discover Monkey Sol Inu, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
        <meta name="keywords" content="Monkey Sol Inu, DeFi, meme coin, crypto innovation, community-driven crypto" />
        <meta name="author" content="Monkey Sol Inu Team" />
        <meta property="og:title" content="Monkey Sol Inu - The Future of Meme and DeFi" />
        <meta property="og:description" content="Discover Monkey Sol Inu, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
        <meta property="og:image" content="/images/MSIonSOL.png" />
        <meta property="og:url" content="https://monkeysolinu.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Monkey Sol Inu - The Future of Meme and DeFi" />
        <meta name="twitter:description" content="Discover Monkey Sol Inu, the revolutionary DeFi meme project driving innovation in crypto and community engagement." />
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
