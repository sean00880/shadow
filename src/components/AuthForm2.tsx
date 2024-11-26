"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import { supabase } from "../utils/supaBaseClient";
import AlertModal from "./AlertModal";
import { useAuthContext } from "../context/AuthContext";
import Footer from "./Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfileImageUrl } from "../utils/imageUtils";

interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  about: string;
  account_identifier: string;
  profile_image_url: string | null;
  banner_image_url: string | null;
  membership_tier: string;
  role: string;
  profile_type: string;
  created_at: string;
}


export default function AuthForm({ isDarkMode }: { isDarkMode: boolean }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [membershipTier, setMembershipTier] = useState("basic");
  const [role, setRole] = useState("Normie");
  const [profileType, setProfileType] = useState("Normie");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    displayName: "",
    username: "",
    about: "",
  });
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  

  const {
    displayName,
    setDisplayName,
    username,
    setUsername,
    about,
    setAbout,
    accountIdentifier,
    walletAddress,
    logout,
  } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const initializeAuthFlow = async () => {
      if (!walletAddress) {
        router.replace("/auth#connect");
        return;
      }
  
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("account_identifier", accountIdentifier)
          .single();
  
        if (error || !data) {
          setCurrentStep(2); // Move to profile creation
          router.replace("/auth#create-profile");
        } else {
          setProfileData(data); // Load the existing profile
          router.replace("/auth#overview");
        }
      } catch (error) {
        console.error("Error during auth flow:", error);
        router.replace("/auth#connect");
      }
    };
  
    initializeAuthFlow();
  }, [walletAddress, accountIdentifier, router]);
  

  const handleLogout = async () => {
    await logout();
    setProfileData(null);
    router.push("/auth#connect");
  };

  const validateDisplayName = (value: string) => {
    if (value.length < 3 || value.length > 50) return "Must be 3–50 characters long.";
    if (!/^[a-zA-Z0-9_ ]+$/.test(value)) return "Only letters, numbers, spaces, and underscores allowed.";
    return "";
  };

  const validateUsername = (value: string) => {
    if (value.length < 3 || value.length > 20) return "Must be 3–20 characters long.";
    if (!/^[a-zA-Z0-9_.]+$/.test(value)) return "Only letters, numbers, underscores, and periods allowed.";
    return "";
  };

  const validateAbout = (value: string) => {
    if (value.length > 250) return "Cannot exceed 250 characters.";
    return "";
  };

  const handleChange = useCallback(
    (
      setter: (value: string) => void,
      validator: (value: string) => string,
      field: keyof typeof errors
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setter(value);
      setErrors((prev) => ({
        ...prev,
        [field]: validator(value),
      }));
    },
    []
  );

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) setImage(file);
  };

  const uploadImageToBucket = async (
    file: File | null,
    folder: string,
    filePrefix: string
  ): Promise<string | null> => {
    if (!file) return null;
  
    const fileType = file.type.split("/")[1]; // Get file extension
    const filename = `${filePrefix}.${fileType}`; // Construct full filename
  
    const { error } = await supabase.storage
      .from("profile-images")
      .upload(`${folder}/${filename}`, file, {
        cacheControl: "3600", // Cache for performance
        upsert: true, // Overwrite existing file
        contentType: file.type, // Set content type
      });
  
    if (error) {
      console.error("Error uploading image:", error.message);
      throw new Error("Failed to upload image.");
    }
  
    return `/api/${folder}/${filePrefix}.${fileType}`; // Return API link
  };
  
  
  

  const handleSubmitProfile = async () => {
    if (!isFormValid()) {
      setAlertMessage("Please fix all errors before submitting.");
      console.log("Invalid form data. Current state:", {
        displayName,
        username,
        about,
        accountIdentifier,
      });
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("Starting profile submission...");
      console.log("Account Identifier:", accountIdentifier);
  
      // Upload Images
      const profileFolder = username || "default";
      const profileImageUrl = profilePicture
        ? await uploadImageToBucket(profilePicture, profileFolder, "profile")
        : null;
  
      console.log("Uploaded Profile Image URL:", profileImageUrl);
  
      const bannerImageUrl = bannerImage
        ? await uploadImageToBucket(bannerImage, profileFolder, "banner")
        : null;
  
      console.log("Uploaded Banner Image URL:", bannerImageUrl);
  
      const profilePayload = {
        display_name: displayName,
        username,
        about,
        role,
        profile_type: profileType,
        membership_tier: membershipTier,
        account_identifier: accountIdentifier,
        profile_image_url: profileImageUrl,
        banner_image_url: bannerImageUrl,
      };
  
      console.log("Profile Payload:", profilePayload);
  
      const { data, error } = await supabase.from("profiles").insert(profilePayload);
  
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
  
      console.log("Profile created successfully:", data);
      setAlertMessage("Profile created successfully!");
      router.push("/auth#Overview");
    } catch (err) {
      console.error("Error creating profile:", err);
      setAlertMessage("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const isFormValid = () => {
    return !errors.displayName && !errors.username && !errors.about && displayName && username;
  };

  const nextStep = () => {
    if (currentStep === 2 && !isFormValid()) {
      setAlertMessage("Please fix all errors before continuing.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCloseAlert = () => setAlertMessage(null);

  const containerStyle = `${isDarkMode ? "" : "bg-white/80"} backdrop-blur-md border rounded-lg p-6 shadow-lg`;

  const customUploadButtonStyle = `
    py-2 px-4 mt-2 bg-white/20 border border-white/30 rounded-lg
    shadow-xl backdrop-blur-md hover:bg-white/30 transition-all duration-300
    cursor-pointer transform hover:scale-105 text
  `;
  if (profileData) {
    const profileImageUrl = getProfileImageUrl(profileData.username, "profile");
    const bannerImageUrl = getProfileImageUrl(profileData.username, "banner");
  
    return (
      <div className="flex flex-col w-full min-h-screen mt-20">
        <div className={`${containerStyle} w-full md:w-2/3 mx-auto text-center`}>
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 text-xl font-bold"
          >
            Welcome, {profileData.display_name || "User"}!
          </motion.h2>
          <motion.h5
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 text-xl font-bold"
          >
            {profileData.about || "About Info"}!
          </motion.h5>
  
          {/* Profile Overview */}
          <div className="relative w-full mb-4 h-32 bg-gray-700 rounded-md flex justify-center items-center">
            {bannerImageUrl ? (
              <Image
                src={bannerImageUrl}
                alt="Banner Preview"
                width={500}
                height={200}
                className="rounded-md"
              />
            ) : (
              <span className="text-gray-400">Banner Placeholder</span>
            )}
          </div>
  
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border border-gray-300">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile Preview"
                width={96}
                height={96}
                className="rounded-full"
              />
            ) : (
              <div className="flex justify-center items-center h-full bg-gray-200">
                <span>Profile Placeholder</span>
              </div>
            )}
          </div>
  
          {/* Navigation Buttons */}
          <div className="flex flex-col items-center space-y-4">
            <Link href="/home">
              <button className="gradient-button px-4 py-2 rounded-md w-1/2">Go to Feed</button>
            </Link>
            <Link href="/trending">
              <button className="gradient-button px-4 py-2 rounded-md w-1/2">Trending</button>
            </Link>
            <Link href={`/${profileData.username}`}>
              <button className="gradient-button px-4 py-2 rounded-md w-1/2">View Profile</button>
            </Link>
          </div>
  
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <>
      <div className="flex flex-col w-full min-h-screen mt-20">
        {alertMessage && <AlertModal message={alertMessage} onClose={handleCloseAlert} />}

        <div className="progress-bar-container flex self-center items-center">
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Main Content Container */}
        <div className="flex flex-1 flex-col md:flex-row justify-center items-stretch">
          {/* Left Column: Form */}
          <div className="flex-1 w-full md:w-1/2 p-4 md:p-6 flex justify-center items-center relative">
            <div className={`${containerStyle} w-full flex flex-col`}>
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                {currentStep === 1
                  ? "Connect Your Wallet"
                  : currentStep === 2
                  ? "Create Your Profile"
                  : "Submit Your Profile"}
              </motion.h2>

              {/* Step 1: Connect */}
              {currentStep === 1 && (
                <motion.div className="flex flex-col w-[50%] self-center items-center justify-center">
                  <w3m-button />
                  <button
                    className="gradient-button mt-4 px-4 py-2 rounded-md"
                    disabled={!walletAddress}
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Step 2: Create Profile */}
              {currentStep === 2 && (
                <form>
                  <h6 className="absolute top-2 right-2 text-sm">
                    <span className="text-red-500">*</span>{" "}
                    <span className="text-sm italic">= Required Fields</span>
                  </h6>
                  <span>Create Your Profile:</span>
                  <div className="mt-2 space-y-4">
                    {/* Display Name Input */}
                    <label className="block">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your display name..."
                      className={`text w-full p-2 border rounded-md bg-transparent ${
                        errors.displayName ? "border-red-500" : "border-gray-300"
                      }`}
                      value={displayName}
                      onChange={handleChange(setDisplayName, validateDisplayName, "displayName")}
                      required
                    />
                    {errors.displayName && (
                      <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
                    )}

                    {/* Username Input */}
                    <label className="block mt-4">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your username..."
                      className={`text w-full p-2 border rounded-md bg-transparent ${
                        errors.username ? "border-red-500" : "border-gray-300"
                      }`}
                      value={username}
                      onChange={handleChange(setUsername, validateUsername, "username")}
                      required
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                    )}

                    {/* About Input */}
                    <label className="block mt-4">About/Introduction</label>
                    <textarea
                      placeholder="Tell us about yourself or your role..."
                      className={`text w-full p-2 border rounded-md bg-transparent ${
                        errors.about ? "border-red-500" : "border-gray-300"
                      }`}
                      value={about}
                      onChange={handleChange(setAbout, validateAbout, "about")}
                    />
                    {errors.about && (
                      <p className="text-sm text-red-500 mt-1">{errors.about}</p>
                    )}
                  </div>
                </form>
              )}

              {/* Step 3: Submit Profile */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Profile Setup</h3>
                  <p className="text-sm text">Choose your membership tier:</p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center text">
                      <input
                        type="radio"
                        name="membershipTier"
                        value="basic"
                        checked={membershipTier === "basic"}
                        onChange={() => setMembershipTier("basic")}
                        className="mr-2"
                      />
                      Basic
                    </label>
                    <label className="flex items-center text">
                      <input
                        type="radio"
                        name="membershipTier"
                        value="verified"
                        checked={membershipTier === "verified"}
                        onChange={() => setMembershipTier("verified")}
                        className="mr-2"
                      />
                      <Image src="/icons/verified2.png" alt="Verified Icon" width={20} height={20} />
                      Verified
                    </label>
                  </div>

                  {/* Profile Type */}
                  <label className="block mt-4 text">Profile Type</label>
                  <select
                    className="w-full p-2 border rounded-md bg-transparent"
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value)}
                  >
                    {["Crypto Project", "Individual", "Group"].map((profileOption) => (
                      <option key={profileOption} value={profileOption}>
                        {profileOption}
                      </option>
                    ))}
                  </select>

                  {/* Role */}
                  <label className="block mt-4 text">Role</label>
                  <select
                    className="w-full p-2 border rounded-md bg-transparent"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {[
                      "Crypto Community",
                      "Influencer",
                      "Trader",
                      "Shiller",
                      "Developer",
                      "KOL Group",
                      "NFT Community",
                      "Normie",
                    ].map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Preview */}
          {(currentStep === 2 || currentStep === 3) && (
            <div className="w-full md:w-1/2 md:h-[calc(100vh-4rem)] bottom-0 p-4 md:sticky">
              <div className={`${containerStyle} w-full top-[20%] sticky`}>
                <div className="relative w-full mb-4 h-32 bg-gray-700 rounded-md flex justify-center items-center">
                  {bannerImage ? (
                    <Image
                      src={URL.createObjectURL(bannerImage)}
                      alt="Banner Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  ) : (
                    <span className="text-gray-400">Banner Placeholder</span>
                  )}
                </div>
                <label className="custom-upload-button" htmlFor="banner-upload">
                  <input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setBannerImage)}
                  />
                  <div className={customUploadButtonStyle}>Upload Banner Image</div>
                </label>
                <div className="relative w-24 h-24 mt-4 mb-2 rounded-full overflow-hidden border border-gray-300">
                  {profilePicture ? (
                    <Image
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex justify-center w-full text-black text-center items-center h-full bg-gray-200">
                      <span>Profile Placeholder</span>
                    </div>
                  )}
                </div>
                <label className="custom-upload-button" htmlFor="profile-upload">
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setProfilePicture)}
                  />
                  <div className={customUploadButtonStyle}>Upload Profile Image</div>
                </label>
                <div className="mt-4 text-left w-full">
                  <h3 className="font-bold text-lg flex flex-row">
                    {displayName || "Display Name"}{" "}
                    {membershipTier === "verified" && (
                      <Image src="/icons/verified2.png" alt="Verified" width={16} height={16} />
                    )}
                  </h3>
                  <p className="text-sm text-gray-400">@{username || "username"}</p>
                  <p className="mt-2">{about || "Your introduction will appear here."}</p>
                </div>
                {currentStep === 3 && (
                  <button
                    onClick={handleSubmitProfile}
                    className="mt-4 gradient-button p-2 rounded-md w-full"
                    disabled={loading}
                  >
                    {loading ? "Creating Profile..." : "Submit Profile"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-4 md:fixed z-50 md:bottom-4 md:right-4 flex justify-center md:justify-end space-x-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="p-2 text border rounded-md bg-black hover:bg-gray-100 hover:text-[#af9f45] transition"
            >
              Back
            </button>
          )}
          {currentStep < 3 && (
            <button onClick={nextStep} className="gradient-button p-2 rounded-md">
              Continue
            </button>
          )}
        </div>
      </div>
      <div className="z-10 w-full">
        <Footer />
      </div>
    </>
  );
}