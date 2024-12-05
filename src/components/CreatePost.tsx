"use client";

import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "../utils/supaBaseClient";
import { useAuthContext } from "../context/AuthContext";

interface CreatePostProps {
  onPostCreated: () => void; // Callback to refresh the post list after creating a new post
  parentId?: string | null; // Optional parent ID for replies
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, parentId = null }) => {
  const { accountIdentifier } = useAuthContext();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const validFiles = filesArray.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (validFiles.length < filesArray.length) {
      alert("Some files were skipped as they are not supported (only images/videos are allowed).");
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert("Cannot create an empty post.");
      return;
    }
  
    setUploading(true);
    try {
      const uploadedMediaUrls: string[] = [];
    
      for (const file of mediaFiles) {
        const fileName = `${Date.now()}_${file.name}`;
    
        // Upload the file to the Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);
    
        if (uploadError) {
          throw new Error(`Failed to upload media: ${file.name}`);
        }
    
        // Retrieve the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
    
        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error(`Failed to retrieve public URL for: ${fileName}`);
        }
    
        // Push the public URL to the array
        uploadedMediaUrls.push(publicUrlData.publicUrl);
      }
    
      // Insert the post data into the database
      const { error: insertError } = await supabase.from("posts").insert({
        profile_id: accountIdentifier,
        content,
        media_links: uploadedMediaUrls,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        boosts: 0,
        reshares: 0,
        comments_count: 0,
      });
    
      if (insertError) {
        throw insertError;
      }
    
      // Reset the form after successful post creation
      setContent("");
      setMediaFiles([]);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    } finally {
      setUploading(false);
    }
    

  };
  

  return (
    <div className="create-post p-4 border-b bg-white dark:bg-gray-900">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Image
            src="/default-avatar.png"
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex-grow ml-4">
          <textarea
            className="w-full p-2 text-gray-800 dark:text-gray-200 bg-transparent border-none focus:outline-none resize-none"
            rows={2}
            placeholder="What is happening?!"
            value={content}
            onChange={handleContentChange}
          ></textarea>
          {mediaFiles.length > 0 && (
            <div className="media-preview grid grid-cols-3 gap-2 mt-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Uploaded preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-lg"
                  />
                  <button
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                    onClick={() => removeMediaFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="media-upload"
                className="text-blue-500 cursor-pointer hover:opacity-80"
              >
                📷 Add Media
              </label>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
              />
            </div>
            <button
              onClick={handlePost}
              className={`px-4 py-1 rounded-full text-white ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={uploading}
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
