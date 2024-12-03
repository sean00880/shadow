import React from "react";
import { headers } from "next/headers";
import RootLayoutClient from "./layout";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "../context/AuthContext";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieHeaders = await headers(); // Await the headers properly
  const cookie = cookieHeaders.get("cookie");
  const initialState = cookieToInitialState(wagmiConfig(), cookie || "");

  return <RootLayoutClient initialState={initialState}>{children}</RootLayoutClient>;
}
