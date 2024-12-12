import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    address: string;
    chainId: number;
  }

  interface Session {
    address: string;
    chainId: number;
    supabaseAccessToken?: string;
  }
}
