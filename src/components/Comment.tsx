"use client";

import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "../utils/supaBaseClient";
import { useAuthContext } from "../context/AuthContext";

interface CommentProps {
  comment: {
    id: string;
    profile_id: string;
    parent_id: string | null; // Reference to parent post or comment
    content: string;
    media_links?: string[]; // Updated to use media_links
    timestamp: string;
    likes: number;
    dislikes: number;
    username: string;
    profile_image_url: string;
    membership_tier: string;
  };
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [userReaction, setUserReaction] = useState<null | "like" | "dislike">(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { accountIdentifier } = useAuthContext();

  const handleReaction = async (type: "like" | "dislike") => {
    if (!accountIdentifier) {
      alert("You need to be logged in to interact with comments.");
      return;
    }

    const isLike = type === "like";

    if (userReaction === type) {
      if (isLike) {
        setLikes((prev) => prev - 1);
      } else {
        setDislikes((prev) => prev - 1);
      }
      setUserReaction(null);
    } else {
      if (isLike) {
        setLikes((prev) => prev + 1);
      } else {
        setDislikes((prev) => prev + 1);
      }

      if (userReaction) {
        if (userReaction === "like") {
          setLikes((prev) => prev - 1);
        } else {
          setDislikes((prev) => prev - 1);
        }
      }

      setUserReaction(type);
    }

    const updatedReactions = {
      likes: isLike ? likes : likes - 1,
      dislikes: !isLike ? dislikes : dislikes - 1,
    };

    await supabase.from("posts").update(updatedReactions).eq("id", comment.id);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      alert("Reply content cannot be empty.");
      return;
    }

    if (!accountIdentifier) {
      alert("You need to log in to reply.");
      return;
    }

    try {
      const { error } = await supabase.from("posts").insert({
        profile_id: accountIdentifier,
        parent_id: comment.id, // Associate the reply with the current comment
        content: replyContent.trim(),
        media_links: [],
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        boosts: 0,
        reshares: 0,
        comments_count: 0,
      });

      if (error) throw error;

      setReplyContent("");
      setIsReplying(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting reply:", err.message);
        alert("Failed to submit reply. Please try again.");
      }
    }
  };

  const renderMedia = () => {
    if (!comment.media_links || comment.media_links.length === 0) return null;

    return (
      <div className="comment-media grid grid-cols-2 gap-2 mt-2">
        {comment.media_links.map((url, index) => (
          <div key={index} className="relative cursor-pointer">
            <a href={`/posts/${comment.id}/media/${index}`} target="_blank" rel="noopener noreferrer">
              <Image src={url} alt={`Media ${index + 1}`} width={250} height={250} className="rounded-lg" />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="comment p-4 border-b last:border-none bg-gray-50 dark:bg-gray-800">
      <div className="flex items-start">
        <Image
          src={comment.profile_image_url || "/default-avatar.png"}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3 w-full">
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{comment.username}</span>
            {comment.membership_tier === "verified" && (
              <Image
                src="/icons/verified2.png"
                alt="Verified"
                width={16}
                height={16}
                className="ml-1"
              />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {new Date(comment.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
          {renderMedia()}
          <div className="flex items-center space-x-4 mt-2">
            <button onClick={() => handleReaction("like")} className="text-sm text-blue-500 hover:underline">
              👍 {likes}
            </button>
            <button onClick={() => handleReaction("dislike")} className="text-sm text-red-500 hover:underline">
              👎 {dislikes}
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-sm text-green-500 hover:underline"
            >
              💬 Reply
            </button>
          </div>
        </div>
      </div>
      {isReplying && (
        <div className="mt-3 ml-12">
          <textarea
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            rows={2}
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-2 space-x-2">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => setIsReplying(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleReplySubmit}
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
