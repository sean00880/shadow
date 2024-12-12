import { createClient } from "@supabase/supabase-js";
import { getSession } from "next-auth/react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const getSupabaseClient = async () => {
  const session = await getSession();
  console.log("Session retrieved in getSupabaseClient:", session); // Debugging log

  if (!session?.supabaseAccessToken) {
    throw new Error("Supabase access token is missing in the session.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.supabaseAccessToken}`,
      },
    },
  });
};
