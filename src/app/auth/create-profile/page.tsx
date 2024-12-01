"use client";

import { useState, useMemo, memo } from "react";
import ProfileForm from "../../../components/ProfileForm";
import ProfilePreview from "../../../components/ProfilePreview";
import AlertModal from "../../../components/AlertModal";
import { supabase } from "../../../utils/supaBaseClient";
import { useAuthContext } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { generateShortId } from "../../../utils/idGenerator";

// Memoized Components
const MemoizedProfileForm = memo(ProfileForm);
const MemoizedProfilePreview = memo(ProfilePreview);
const MemoizedAlertModal = memo(AlertModal);

export default function CreateProfilePage() {
  const { walletAddress, accountIdentifier, blockchainWallet, fetchProfiles } = useAuthContext();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    displayName: "",
    username: "",
    about: "",
    profilePicture: null as File | null,
    bannerImage: null as File | null,
    profileType: "Individual",
    role: "Normie",
    membershipTier: "basic",
    email: "",
    password: "",
    linked: [],
    links: [],
  });

  type ErrorState = {
    displayName?: string;
    username?: string;
    about?: string;
  };

  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showRedirect, setShowRedirect] = useState(false);

  const validateField = (field: string, value: string) => {
    if (field === "displayName" && (value.length < 3 || value.length > 50)) {
      return "Display Name must be 3–50 characters long.";
    }
    if (field === "username" && (value.length < 3 || value.length > 20)) {
      return "Username must be 3–20 characters long.";
    }
    if (field === "about" && value.length > 250) {
      return "About section cannot exceed 250 characters.";
    }
    return "";
  };

  const handleChange = (field: keyof typeof profileData, value: string | File | null) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (typeof value === "string") {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const isFormValid = useMemo(
    () => !Object.values(errors).some((error) => error) && profileData.displayName && profileData.username,
    [errors, profileData.displayName, profileData.username]
  );

  const uploadImageToBucket = async (file: File | null, folder: string, filePrefix: string) => {
    if (!file) return null;
    try {
      const fileType = file.type.split("/")[1];
      const filename = `${filePrefix}.${fileType}`;
      const { error } = await supabase.storage
        .from("profile-images")
        .upload(`${folder}/${filename}`, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (error) throw new Error("Failed to upload image.");
      return `/api/${folder}/${filename}`;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleSubmitProfile = async () => {
    if (!walletAddress || !isFormValid || !accountIdentifier) {
      const errors = [];
      if (!walletAddress) errors.push("Please connect your wallet.");
      if (!isFormValid) errors.push("Please fix all errors before submitting.");
      if (!accountIdentifier) errors.push("Account identifier is missing.");

      setAlertMessage(errors.join(" "));
      return;
    }

    setLoading(true);

    try {
      const profileFolder = profileData.username || "default";

      // Concurrently upload images for optimization
      const [profileImageUrl, bannerImageUrl] = await Promise.all([
        uploadImageToBucket(profileData.profilePicture, profileFolder, "profile"),
        uploadImageToBucket(profileData.bannerImage, profileFolder, "banner"),
      ]);

      const shortId = await generateShortId();

      const payload = {
        display_name: profileData.displayName,
        username: profileData.username,
        about: profileData.about,
        account_identifier: accountIdentifier,
        wallet_address: walletAddress,
        blockchain_wallet: blockchainWallet,
        profile_image_url: profileImageUrl,
        banner_image_url: bannerImageUrl,
        profile_type: profileData.profileType,
        role: profileData.role,
        membership_tier: profileData.membershipTier,
        ...(profileData.email && { email: profileData.email }),
        ...(profileData.password && { password: profileData.password }),
        ...(profileData.linked.length > 0 && { linked: profileData.linked }),
        ...(profileData.links.length > 0 && { links: profileData.links }),
        short_id: shortId,
      };

      // Check for existing profiles by wallet address or username
      const [existingProfilesByWallet, existingProfilesByUsername] = await Promise.all([
        supabase
          .from("profiles")
          .select("id")
          .eq("wallet_address", walletAddress),
        supabase
          .from("profiles")
          .select("id")
          .eq("account_identifier", accountIdentifier)
          .eq("username", profileData.username),
      ]);

      if (existingProfilesByWallet.data?.length) {
        throw new Error("A profile already exists for this wallet address.");
      }

      if (existingProfilesByUsername.data?.length) {
        throw new Error("A profile with the same username already exists under this account.");
      }

      // Insert the new profile
      const { error } = await supabase.from("profiles").insert(payload);
      if (error) throw new Error(error.message);

      // Refresh profiles after creation
      if (accountIdentifier) {
        await fetchProfiles(accountIdentifier);
      }

      setAlertMessage("Profile created successfully!");
      setShowRedirect(true);
    } catch (error) {
      console.error("Profile creation failed:", error);
      setAlertMessage(
        error instanceof Error ? error.message : "An unexpected error occurred during profile creation."
      );
    } finally {
      setLoading(false);
    }
  };

  const alertModal = useMemo(() => {
    if (!alertMessage) return null;
    return <MemoizedAlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />;
  }, [alertMessage]);

  const redirectModal = useMemo(() => {
    if (!showRedirect) return null;
    return (
      <MemoizedAlertModal
        message="Profile created successfully! Redirecting to overview..."
        onClose={() => {
          setShowRedirect(false);
          setTimeout(() => {
            router.replace("/auth/overview");
          }, 300);
        }}
      />
    );
  }, [showRedirect, router]);

  return (
    <div className="auth flex flex-col md:flex-row min-h-screen">
      {alertModal}
      {redirectModal}

      <div className="w-full md:w-1/2 overflow-auto p-4 mt-40">
        <MemoizedProfileForm profileData={profileData} handleChange={handleChange} errors={errors} />
      </div>

      <div className="w-full md:w-1/2 flex justify-center items-start">
        <div className="sticky top-20 p-6 w-full">
          <MemoizedProfilePreview profileData={profileData} />
          <div className="w-full mt-6">
            <button
              onClick={handleSubmitProfile}
              className="gradient-button p-2 rounded-md w-full"
              disabled={loading}
            >
              {loading ? "Creating Profile..." : "Submit Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
