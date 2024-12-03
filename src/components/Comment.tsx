"use client";
import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "src/utils/supaBaseClient";

interface Comment {
  id: string;
  profile_id: string;
  post_id: string;
  content: string;
  media?: string[]; // Array of image URLs
  timestamp: string;
  likes: number;
  dislikes: number;
  boosts: number;
  reshares: number;
  comments_count: number;
  username: string;
  profile_image_url: string; // Updated from avatar
  membership_tier: string; // Used to determine if user is verified
}

interface CommentProps {
  comment: Comment;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikes);
  const [boostCount, setBoostCount] = useState(comment.boosts);
  const [reshareCount, setReshareCount] = useState(comment.reshares);
  const [userReaction, setUserReaction] = useState<null | "like" | "dislike">(null);

  // Determine if the user is verified based on membership_tier
  const isVerified = comment.membership_tier === "verified";

  const handleLike = async () => {
    if (userReaction === "like") {
      setLikeCount(likeCount - 1);
      setUserReaction(null);
    } else {
      setLikeCount(likeCount + 1);
      if (userReaction === "dislike") setDislikeCount(dislikeCount - 1);
      setUserReaction("like");
    }
    await updateReaction("likes", likeCount + (userReaction === "like" ? -1 : 1));
  };

  const handleDislike = async () => {
    if (userReaction === "dislike") {
      setDislikeCount(dislikeCount - 1);
      setUserReaction(null);
    } else {
      setDislikeCount(dislikeCount + 1);
      if (userReaction === "like") setLikeCount(likeCount - 1);
      setUserReaction("dislike");
    }
    await updateReaction("dislikes", dislikeCount + (userReaction === "dislike" ? -1 : 1));
  };

  const handleBoost = async () => {
    setBoostCount(boostCount + 1);
    await updateReaction("boosts", boostCount + 1);
  };

  const handleReshare = async () => {
    setReshareCount(reshareCount + 1);
    await updateReaction("reshares", reshareCount + 1);
  };

  const updateReaction = async (field: string, value: number) => {
    try {
      const { error } = await supabase
        .from("replies")
        .update({ [field]: value })
        .eq("id", comment.id);
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  return (
    <div className="comment mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center mb-2">
        <Image
          src={comment.profile_image_url || "/default-avatar.png"}
          alt={`${comment.username}'s profile image`}
          width={40}
          height={40}
          className="rounded-full mr-2"
        />
        <div>
          <div className="flex items-center">
            <span className="font-semibold text-sm">{comment.username}</span>
            {isVerified && (
              <Image
                src="/icons/verified2.png"
                alt="Verified"
                width={14}
                height={14}
                className="ml-1"
              />
            )}
          </div>
          <span className="text-xs text-gray-500">
            {new Date(comment.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{comment.content}</p>
      {comment.media && comment.media.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {comment.media.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Comment media ${idx + 1}`}
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
          ))}
        </div>
      )}
      <div className="flex items-center mt-2 text-sm">
        <button
          onClick={handleLike}
          className={`mr-3 ${userReaction === "like" ? "text-blue-500" : "text-gray-500"}`}
        >
          👍 {likeCount}
        </button>
        <button
          onClick={handleDislike}
          className={`mr-3 ${userReaction === "dislike" ? "text-red-500" : "text-gray-500"}`}
        >
          👎 {dislikeCount}
        </button>
        <button
          onClick={handleBoost}
          className="mr-3 text-gray-500 hover:text-yellow-500"
        >
          🚀 {boostCount}
        </button>
        <button
          onClick={handleReshare}
          className="text-gray-500 hover:text-green-500"
        >
          🔁 {reshareCount}
        </button>
      </div>
    </div>
  );
};

export default Comment;
