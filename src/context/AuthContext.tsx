"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Connector, useConnect } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, base, bsc } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, base, bsc],
  defaultNetwork: mainnet,
});

export interface Profile {
  id: string;
  displayName: string;
  username: string;
  about: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  walletAddress: string;
  accountIdentifier: string;
}

interface AuthContextType {
  walletAddress: string | null;
  accountIdentifier: string | null;
  blockchainWallet: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  isConnected: boolean;
  isSwitchingProfile: boolean;
  setActiveProfile: (profile: Profile | null) => void;
  switchProfile: (profileId: string) => Promise<void>;
  fetchProfiles: (wallet: string | null) => Promise<void>;
  logout: () => void;
  connect: (connector: Connector) => Promise<void>;
  connectors: readonly Connector[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [session, setSession] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [accountIdentifier, setAccountIdentifier] = useState<string | null>(null);
  const [blockchainWallet, setBlockchainWallet] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState<boolean>(false);

  // Assign credentials if needed (optional, unchanged)
  const assignCredentials = useCallback(async () => {
    try {
      const { data: fetchedProfiles, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
      }
      if (!fetchedProfiles || fetchedProfiles.length === 0) {
        console.log("No profiles found.");
        return;
      }
      for (const profile of fetchedProfiles) {
        const email = `${profile.username}@yourdomain.com`;
        const password = `${profile.walletAddress}-${profile.username}`;
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { profile_id: profile.id },
          },
        });
        if (signUpError && !signUpError.message.includes("User already registered")) {
          console.error(`Error signing up user for profile ${profile.id}:`, signUpError.message);
        }
      }
      console.log("Credentials assigned successfully.");
    } catch (outerError) {
      console.error("Error assigning credentials:", outerError);
    }
  }, []);

  useEffect(() => {
    assignCredentials();
  }, [assignCredentials]);

  const fetchProfiles = useCallback(
    async (wallet: string | null) => {
      if (!wallet || !session?.user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);

        if (error) throw new Error(error.message);

        if (data && data.length > 0) {
          setProfiles(data);

          // Determine activeProfile based on user_metadata.profile_id
          const profileIdFromMetadata = session.user.user_metadata?.profile_id;
          let chosenProfile = profileIdFromMetadata
            ? data.find((p) => p.id === profileIdFromMetadata)
            : null;

          // If no chosenProfile or profile_id not valid, default to the first profile
          if (!chosenProfile) {
            chosenProfile = data[0];
            // Update metadata to reflect this chosen profile for future loads
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                ...session.user.user_metadata,
                profile_id: chosenProfile.id,
                walletAddress: wallet,
              },
            });
            if (updateError) {
              console.error("Error updating user metadata:", updateError.message);
            }
          }

          setActiveProfile(chosenProfile || null);
          setAccountIdentifier(chosenProfile?.accountIdentifier || null);
        } else {
          setProfiles([]);
          setActiveProfile(null);
          setAccountIdentifier(null);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [session]
  );

  // Initialize session and handle auth changes
  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);

      const currentSession = data?.session || null;
      setSession(currentSession);

      if (currentSession?.user) {
        const { walletAddress: storedWallet } = currentSession.user.user_metadata || {};
        if (storedWallet) {
          setWalletAddress(storedWallet);
          await fetchProfiles(storedWallet);
        } else {
          setWalletAddress(null);
        }
      } else {
        // No session: reset state
        setWalletAddress(null);
        setBlockchainWallet(null);
        setProfiles([]);
        setActiveProfile(null);
        setAccountIdentifier(null);
      }
    };

    initSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (!newSession) {
          // Signed out
          setWalletAddress(null);
          setBlockchainWallet(null);
          setProfiles([]);
          setActiveProfile(null);
          setAccountIdentifier(null);
        } else {
          const { walletAddress: storedWallet } = newSession.user.user_metadata || {};
          if (storedWallet) {
            setWalletAddress(storedWallet);
            await fetchProfiles(storedWallet);
          }
        }
      }
    );

    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, [fetchProfiles]);

  // When the user connects a wallet, if metadata has no wallet, update it and fetch profiles.
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address && session?.user) {
        setWalletAddress(address);
        setBlockchainWallet(caipAddress || null);
        // Fetch profiles for this new wallet
        await fetchProfiles(address);
      }
    };
    handleWalletConnection();
  }, [isConnected, address, caipAddress, session, fetchProfiles]);

  const switchProfile = useCallback(
    async (profileId: string) => {
      setIsSwitchingProfile(true);
      try {
        const selectedProfile = profiles.find((p) => p.id === profileId);
        if (selectedProfile && session?.user) {
          setActiveProfile(selectedProfile);
          setAccountIdentifier(selectedProfile.accountIdentifier);

          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              ...session.user.user_metadata,
              profile_id: profileId,
              walletAddress: selectedProfile.walletAddress,
            },
          });
          if (updateError) {
            console.error("Error updating user profile_id:", updateError.message);
          }
        }
      } catch (error) {
        console.error("Error switching profiles:", error);
      } finally {
        setIsSwitchingProfile(false);
      }
    },
    [profiles, session]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Session listener clears state
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        accountIdentifier,
        blockchainWallet,
        profiles,
        activeProfile,
        isConnected,
        isSwitchingProfile,
        setActiveProfile,
        switchProfile,
        fetchProfiles,
        logout,
        connect: async (connector: Connector) => await connect({ connector }),
        connectors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
