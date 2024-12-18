"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DocumentationLayout from "../components/DocumentationLayout";
import DocumentationLayout2 from "../components/DocumentationLayout2";

const posts = [
  { title: "How MemeLinked Integrates DeFi and Social Networking", href: "/blog/defi-social-networking" },
  { title: "GameFi’s Role in the MemeLinked Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Future of Meme-Driven Finance", href: "/blog/meme-finance-future" },
];

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isDocumentationPage = pathname.startsWith("/docs");
  const isBlogPage = pathname.startsWith("/blog");

  if (isLandingPage) {
    return <>{children}</>;
  } else if (isDocumentationPage) {
    return <DocumentationLayout2 posts={posts}>{children}</DocumentationLayout2>;
  } else if (isBlogPage) {
    return <DocumentationLayout posts={posts}>{children}</DocumentationLayout>;
  } 
}
