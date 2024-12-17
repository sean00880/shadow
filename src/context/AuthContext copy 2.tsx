"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useState,
} from "react";

import { Connector, useConnect } from "wagmi";
import { useAppKitAccount, useDisconnect  } from "@reown/appkit/react";
import { supabase } from "../utils/supaBaseClient";
import { wagmiAdapter, projectId } from "../lib/config";
import { mainnet, bsc, base } from "wagmi/chains";
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
  switchProfile: (profileId: string) => void;
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
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { address, isConnected, caipAddress } = useAppKitAccount();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    })();
  }, []);

  const assignCredentials = useCallback(async () => {
    try {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log("No profiles found.");
        return;
      }

      for (const profile of profiles) {
        const email = `${profile.username}@yourdomain.com`;
        const password = `${profile.wallet_address}-${profile.username}`;

        try {
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
        } catch (innerError) {
          console.error(`Error during sign-up process for profile ${profile.id}:`, innerError);
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

  const updateUserMetadata = useCallback(async (newData: Record<string, any>) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
      data: { ...currentUser.user_metadata, ...newData },
    });
    if (error) {
      console.error("Error updating user metadata:", error);
    } else {
      setUser(updatedUser);
    }
  }, []);

  const signInUserForWallet = useCallback(async (wallet: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (error) {
      console.error("Error finding profile for wallet:", error.message);
      return false;
    }

    if (!data) {
      console.warn("No profile found for this wallet:", wallet);
      return false;
    }

    const email = `${data.username}@yourdomain.com`;
    const password = `${data.wallet_address}-${data.username}`;

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error("Error signing in user:", signInError.message);
      return false;
    }

    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    setUser(signedInUser);
    console.log("User signed in successfully for wallet:", wallet);
    return true;
  }, []);

  const fetchProfiles = useCallback(
    async (wallet: string | null) => {
      if (!wallet || !user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", wallet);

        if (error) throw new Error(error.message);

        if (data?.length) {
          // If no activeProfile stored in metadata yet, default to the first profile
          const activeProfile = data[0];

          await updateUserMetadata({
            walletAddress: wallet,
            accountIdentifier: data[0].accountIdentifier,
            profiles: data,
            activeProfile: activeProfile || null,
          });
        } else {
          await updateUserMetadata({
            walletAddress: wallet,
            accountIdentifier: null,
            profiles: [],
            activeProfile: null,
          });
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [user, updateUserMetadata]
  );

  const handleWalletConnected = useCallback(async () => {
    if (!address) {
      // Wallet disconnected
      if (user) {
        await updateUserMetadata({
          walletAddress: null,
          blockchainWallet: null,
          profiles: [],
          activeProfile: null,
          accountIdentifier: null,
        });
      }
      return;
    }

    // Wallet is connected, ensure user is signed in
    if (!user) {
      const signedIn = await signInUserForWallet(address);
      if (!signedIn) return;
    }

    // Once signed in, fetch profiles directly from Supabase
    await fetchProfiles(address);

    // Update blockchainWallet if available
    if (caipAddress) {
      await updateUserMetadata({
        blockchainWallet: caipAddress,
      });
    }
  }, [address, caipAddress, user, signInUserForWallet, fetchProfiles, updateUserMetadata]);

  useEffect(() => {
    handleWalletConnected();
  }, [handleWalletConnected]);

  const switchProfile = useCallback(async (profileId: string) => {
    if (!user) return; // no user signed in

    await updateUserMetadata({ isSwitchingProfile: true });
    const currentProfiles = (user.user_metadata?.profiles as Profile[]) || [];
    const selectedProfile = currentProfiles.find((p) => p.id === profileId);

    if (selectedProfile) {
      await updateUserMetadata({
        activeProfile: selectedProfile,
        isSwitchingProfile: false,
      });
    } else {
      await updateUserMetadata({ isSwitchingProfile: false });
    }
  }, [user, updateUserMetadata]);

  
  const logout = useCallback(async () => {
    // Disconnect using Reown's useDisconnect hook
    await supabase.auth.signOut();
    await disconnect();
  
    // Reload the page
    window.location.reload();
  }, []);

  const meta = user?.user_metadata || {};
  const derivedWalletAddress = meta.walletAddress || null;
  const derivedAccountIdentifier = meta.accountIdentifier || null;
  const derivedBlockchainWallet = meta.blockchainWallet || null;
  const derivedProfiles = Array.isArray(meta.profiles) ? meta.profiles : [];
  const derivedActiveProfile = meta.activeProfile || null;
  const derivedIsSwitchingProfile = !!meta.isSwitchingProfile;

  return (
    <AuthContext.Provider
      value={{
        walletAddress: derivedWalletAddress,
        accountIdentifier: derivedAccountIdentifier,
        blockchainWallet: derivedBlockchainWallet,
        profiles: derivedProfiles,
        activeProfile: derivedActiveProfile,
        isConnected,
        isSwitchingProfile: derivedIsSwitchingProfile,
        setActiveProfile: async (profile: Profile | null) =>
          await updateUserMetadata({ activeProfile: profile }),
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
