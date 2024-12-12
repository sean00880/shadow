"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePostContext } from "../context/PostContext";
import Comment from "./Comment";
import { useAuthContext } from "../context/AuthContext"; // 

interface PostProps {
  post: {
    id: string;
    profile_id: string;
    content: string;
    media_links: string[];
    timestamp: string;
    likes: number;
    dislikes: number;
    boosts: number;
    reshares: number;
    comments_count: number;
    liked_by: string[];
    disliked_by: string[];
    boosted_by: string[];
    reshared_by: string[];
  };
  isDarkMode: boolean;
}

const Post: React.FC<PostProps> = ({ post, isDarkMode }) => {
  const [profile, setProfile] = useState<{
    id: string;
    display_name: string;
    username: string;
    profile_image: string;
    verified: boolean;
  } | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const { fetchProfile,toggleOrHandleReaction, fetchComments } = usePostContext();
  const { activeProfile } = useAuthContext(); // Get activeProfile from AuthContext
  // Fetch profile data
  useEffect(() => {
    const loadProfile = async () => {
      const fetchedProfile = await fetchProfile(post.profile_id);
      setProfile(fetchedProfile);
    };
    loadProfile();
  }, [fetchProfile, post.profile_id]);


useEffect(() => {
    if (isCommentsVisible) fetchComments(post.id);
  }, [isCommentsVisible]);


  const toggleCommentsVisibility = () =>
    setIsCommentsVisible(!isCommentsVisible);

  const renderMedia = () => {
    if (!post.media_links || post.media_links.length === 0) return null;

    return (
      <div className="post-media grid grid-cols-2 gap-2 mt-4">
        {post.media_links.map((url, index) => (
          <div key={index} className="relative">
            <Image
              src={url}
              alt={`Media ${index + 1}`}
              width={250}
              height={250}
              className="rounded-lg object-cover"
              priority
            />
          </div>
        ))}
      </div>
    );
  };

  const isBoosted = activeProfile
  ? post.boosted_by?.includes(activeProfile.id) || false
  : false;

const isReshared = activeProfile
  ? post.reshared_by?.includes(activeProfile.id) || false
  : false;



  return (
    <div
      className={`post mb-6 p-4 border rounded-lg ${
        isDarkMode ? "bg-black text-white" : "bg-white text-gray-800"
      }`}
    >
      {profile && (
        <div className="post-header flex items-center mb-2">
          <Image
            src={profile.profile_image}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <span className="font-semibold flex items-center">
              {profile.display_name}
              {profile.verified && (
                <Image
                  src="/icons/verified2.png"
                  alt="Verified"
                  width={16}
                  height={16}
                />
              )}
            </span>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>
        </div>
      )}
      <p className="text-base mb-3">{post.content}</p>
      {renderMedia()}
      <div className="post-interactions flex justify-between mt-3">
        <div
          onClick={() => toggleOrHandleReaction(post.id, "likes")}
          className="interaction-button cursor-pointer"
        >
          👍 {post.likes}
        </div>
        <div
          onClick={() => toggleOrHandleReaction(post.id, "dislikes")}
          className="interaction-button cursor-pointer"
        >
          👎 {post.dislikes}
        </div>
        <div
          onClick={() => toggleOrHandleReaction(post.id, "boosts")}
          className={`interaction-button cursor-pointer ${
            isBoosted ? "text-blue-500" : ""
          }`}
        >
          🚀 {post.boosts}
        </div>
        <div
          onClick={() => toggleOrHandleReaction(post.id, "reshares")}
          className={`interaction-button cursor-pointer ${
            isReshared ? "text-green-500" : ""
          }`}
        >
          🔁 {post.reshares}
        </div>
        <div
          onClick={toggleCommentsVisibility}
          className="interaction-button cursor-pointer"
        >
          💬 {post.comments_count} Comments
        </div>
      </div>
      {isCommentsVisible && (
        <div className="comments-section mt-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
