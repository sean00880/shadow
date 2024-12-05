import React, { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "./config";

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
  const cookies = headersData.get("cookie") || ""; // Safely retrieve cookies
  const initialState = cookieToInitialState(getConfig(), cookies);


  return (
    <Providers initialState={initialState}>
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>MemeLinked</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
       <LayoutContent>{children}</LayoutContent>
        </body>
      </html>
    </Providers>
  );
}
