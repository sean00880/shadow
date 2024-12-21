"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DocumentationLayout from "../components/DocumentationLayout";
import DocumentationLayout2 from "../components/DocumentationLayout2";

const posts = [
  { title: "How Shadow the Hedgehog Reshapes Meme Utility", href: "/blog/meme-utility" },
  { title: "GameFi’s Role in the MSI Ecosystem", href: "/blog/gamefi-role" },
  { title: "The Resilience of Shadow the Hedgehog", href: "/blog/community-resilience" },
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
