"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supaBaseClient";
import Comment from "./Comment";
import { useAuthContext } from "../context/AuthContext";

interface Profile {
  id: string;
  display_name: string;
  username: string;
  profile_image: string;
  verified: boolean;
  links: number;
}

interface CommentProps {
  id: string;
  profile_id: string;
  parent_id: string | null;
  content: string;
  media?: string[];
  timestamp: string;
  likes: number;
  dislikes: number;
  boosts: number;
  reshares: number;
  comments_count: number;
  username: string;
  profile_image_url: string;
  membership_tier: string;
}

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
  };
  isDarkMode: boolean;
}

const Post: React.FC<PostProps> = ({ post, isDarkMode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);
  const [boosts, setBoosts] = useState(post.boosts);
  const [reshares, setReshares] = useState(post.reshares);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { accountIdentifier, activeProfile } = useAuthContext();
  const router = useRouter();

  // Fetch profile associated with the post
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, profile_image, links, membership_tier")
        .eq("id", post.profile_id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      const verified = data.membership_tier === "verified";

      setProfile({
        id: data.id,
        display_name: data.display_name,
        username: data.username,
        profile_image: data.profile_image || "/default-avatar.png",
        links: data.links || 0,
        verified,
      });
    };

    fetchProfile();
  }, [post.profile_id]);

  // Fetch comments for the post
  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profile:profiles(id, display_name, username, profile_image, membership_tier)")
        .eq("parent_id", post.id)
        .order("timestamp", { ascending: true });
  
      if (error) throw error;
  
      setComments(data || []);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching replies:", err.message);
      } else {
        console.error("Unexpected error fetching replies:", err);
      }
    }
  };

  useEffect(() => {
    if (isCommentsVisible) fetchReplies();
  }, [isCommentsVisible]);

  const toggleCommentsVisibility = () => setIsCommentsVisible(!isCommentsVisible);



  const handleBoost = async () => {
    if (!accountIdentifier) {
      alert("You need to be logged in to boost posts.");
      return;
    }
    setBoosts(boosts + 1);
    await supabase.from("posts").update({ boosts: boosts + 1 }).eq("id", post.id);
  };

  const handleReshare = async () => {
    if (!accountIdentifier) {
      alert("You need to be logged in to reshare posts.");
      return;
    }
    setReshares(reshares + 1);
    await supabase.from("posts").update({ reshares: reshares + 1 }).eq("id", post.id);
  };

  const openReplyModal = () => setIsReplyModalOpen(true);
  const closeReplyModal = () => setIsReplyModalOpen(false);

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
        parent_id: post.id,
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
      closeReplyModal();
      fetchReplies();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error submitting reply:", err.message);
        alert("Failed to submit reply. Please try again.");
      } else {
        console.error("Unexpected error submitting reply:", err);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const renderMedia = () => {
    if (!post.media_links || post.media_links.length === 0) return null;
  
    return (
      <div className="post-media grid grid-cols-2 gap-2">
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
  
  return (
    <div className={`post mb-6 p-4 border rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-gray-800"}`}>
      {profile && (
        <div className="post-header flex items-center mb-2">
          <Image src={profile.profile_image} alt="Profile" width={40} height={40} className="rounded-full" />
          <div className="ml-3">
            <span className="font-semibold flex items-center">
              {profile.display_name}
              {profile.verified && <Image src="/icons/verified2.png" alt="Verified" width={16} height={16} />}
            </span>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>
        </div>
      )}
      <p className="text-base mb-3">{post.content}</p>
      {renderMedia()}
      <div className="post-interactions flex justify-between mt-3">
        <button onClick={() => handleReaction("like")} className="interaction-button">👍 {likes}</button>
        <button onClick={() => handleReaction("dislike")} className="interaction-button">👎 {dislikes}</button>
        <button onClick={toggleCommentsVisibility} className="interaction-button">💬 {comments.length} Comments</button>
        <button onClick={handleReshare} className="interaction-button">🔁 {reshares}</button>
        <button onClick={handleBoost} className="interaction-button">🚀 {boosts}</button>
      </div>
      {isCommentsVisible && (
        <div className="comments-section mt-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Reply to Post</h3>
            <textarea
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              rows={4}
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={closeReplyModal}
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
        </div>
      )}
    </div>
  );
};

export default Post;
