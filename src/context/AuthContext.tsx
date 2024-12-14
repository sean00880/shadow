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
  profiles: Profile[]; // If you want to store multiple profiles in memory
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

type UserMetadata = {
  walletAddress?: string | null;
  accountIdentifier?: string | null;
  activeProfile?: Profile | null; 
  profiles?: Profile[] | null;
  profile_id?: string | null;
};

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

  const logUserMetadataAccess = (metadata: any) => {
    console.log("Accessing user_metadata:", JSON.stringify(metadata, null, 2));
  };

  const updateUserMetadata = useCallback(
    async (fields: Partial<UserMetadata>) => {
      if (!session?.user) return;
      const newMetadata = {
        ...session.user.user_metadata,
        ...fields,
      };
      console.log("Updating user_metadata with fields:", fields);
      const { error } = await supabase.auth.updateUser({ data: newMetadata });
      if (error) {
        console.error("Error updating user metadata:", error.message);
      } else {
        console.log("Updated user_metadata:", JSON.stringify(newMetadata, null, 2));
        // Reflect changes locally
        const {
          walletAddress,
          accountIdentifier,
          activeProfile,
          profiles,
        } = newMetadata;
        setWalletAddress(walletAddress ?? null);
        setAccountIdentifier(accountIdentifier ?? null);
        setProfiles(profiles ?? []);
        setActiveProfile(activeProfile ?? null);
      }
    },
    [session]
  );

  const loadActiveProfileById = useCallback(
    async (profileId: string | null | undefined) => {
      if (!profileId) {
        setActiveProfile(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) throw new Error(error.message);
        if (data) {
          console.log("Fetched activeProfile by profile_id:", data);
          setActiveProfile({
            id: data.id,
            displayName: data.display_name || data.username || "User",
            username: data.username,
            about: data.about || "",
            profileImageUrl: data.profile_image_url,
            bannerImageUrl: data.banner_image_url,
            walletAddress: data.wallet_address,
            accountIdentifier: data.accountIdentifier || "",
          });
        } else {
          setActiveProfile(null);
        }
      } catch (error) {
        console.error("Error fetching activeProfile by ID:", error);
        setActiveProfile(null);
      }
    },
    []
  );

  const loadFromMetadata = useCallback(async (metadata: UserMetadata) => {
    logUserMetadataAccess(metadata);
    const {
      walletAddress,
      accountIdentifier,
      activeProfile,
      profiles,
      profile_id
    } = metadata;
    setWalletAddress(walletAddress ?? null);
    setAccountIdentifier(accountIdentifier ?? null);
    setProfiles(profiles ?? []);
    
    // If activeProfile is null but we have a profile_id, fetch it
    if (!activeProfile && profile_id) {
      await loadActiveProfileById(profile_id);
    } else {
      setActiveProfile(activeProfile ?? null);
    }
  }, [loadActiveProfileById]);

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
          // Choose first profile as active if none set
          const chosenActiveProfile = data[0];
          // Update user metadata with these profiles
          await updateUserMetadata({
            walletAddress: wallet,
            accountIdentifier: chosenActiveProfile.accountIdentifier || null,
            profiles: data,
            activeProfile: null, // we will set activeProfile after fetching by ID if needed
            profile_id: chosenActiveProfile.id,
          });
          // Now load that profile as activeProfile by ID
          await loadActiveProfileById(chosenActiveProfile.id);
        } else {
          // No profiles found for this wallet
          await updateUserMetadata({
            walletAddress: wallet,
            accountIdentifier: null,
            profiles: [],
            activeProfile: null,
            profile_id: null,
          });
          setActiveProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    },
    [session, updateUserMetadata, loadActiveProfileById]
  );

  const switchProfile = useCallback(
    async (profileId: string) => {
      setIsSwitchingProfile(true);
      try {
        // Find selected profile in current profiles
        const selectedProfile = profiles.find((p) => p.id === profileId);
        if (selectedProfile) {
          // Update user_metadata with the new activeProfile
          await updateUserMetadata({
            accountIdentifier: selectedProfile.accountIdentifier,
            profile_id: selectedProfile.id,
            activeProfile: null // we'll fetch it again to ensure freshness
          });
          // Now fetch the activeProfile by ID to update local state
          await loadActiveProfileById(selectedProfile.id);
        }
      } catch (error) {
        console.error("Error switching profiles:", error);
      } finally {
        setIsSwitchingProfile(false);
      }
    },
    [profiles, updateUserMetadata, loadActiveProfileById]
  );

  const logout = useCallback(async () => {
    try {
        // Disconnect
      await appKit.adapter?.connectionControllerClient?.disconnect();
  
      console.error(
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    
  }, []);

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
        // Note: Ensure generated emails are valid formats
        // Adjust domain or username if invalid
        const email = `${profile.username}@example.com`;
        const password = `${profile.wallet_address}-${profile.username}`;
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { profile_id: profile.id } },
        });
        if (signUpError && !signUpError.message.includes("User already registered")) {
          console.error(`Error signing up user for profile ${profile.id}:`, signUpError.message);
        } else if (!signUpError) {
          console.log(`User signed up successfully for profile ${profile.id}`);
        }
      }
      console.log("Credentials assigned successfully.");
    } catch (outerError) {
      if (outerError instanceof Error) {
        console.error("Error assigning credentials:", outerError.message);
      } else {
        console.error("Unknown error occurred while assigning credentials:", outerError);
      }
    }
  }, []);

  useEffect(() => {
    assignCredentials();
  }, [assignCredentials]);

  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);
      const currentSession = data?.session || null;
      setSession(currentSession);

      if (currentSession?.user?.user_metadata) {
        await loadFromMetadata(currentSession.user.user_metadata);
      } else {
        setWalletAddress(null);
        setAccountIdentifier(null);
        setProfiles([]);
        setActiveProfile(null);
      }
    };

    initSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.user_metadata) {
        await loadFromMetadata(newSession.user.user_metadata);
      } else {
        setWalletAddress(null);
        setAccountIdentifier(null);
        setProfiles([]);
        setActiveProfile(null);
      }
    });

    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, [loadFromMetadata]);

  // When wallet is connected, you can choose to fetch profiles for that wallet if needed
  // If you rely solely on user_metadata.profile_id, you might only do this once at profile creation
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address && session?.user && walletAddress !== address) {
        console.log("New wallet connected:", address);
        await updateUserMetadata({ walletAddress: address });
        setBlockchainWallet(caipAddress || null);
        // If no activeProfile yet, fetch profiles to set one
        if (!activeProfile) {
          await fetchProfiles(address);
        }
      }
    };
    handleWalletConnection();
  }, [isConnected, address, caipAddress, session, walletAddress, activeProfile, updateUserMetadata, fetchProfiles]);

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
