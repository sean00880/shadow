"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // For dynamic URL navigation
import { supabase } from "../utils/supaBaseClient";
import Comment from "./Comment";
import { useAuthContext } from "../context/AuthContext";


interface Profile {
  id: string;
  display_name: string;
  username: string;
  profile_image: string;
  verified: boolean;
  links: number; // Followers count
}

interface CommentProps {
  id: string;
  profile_id: string;
  post_id: string;
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
    media: string[];
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
  const [userReaction, setUserReaction] = useState<null | "like" | "dislike">(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { accountIdentifier, activeProfile } = useAuthContext();
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null); // Modal state for image
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
  useEffect(() => {
    if (isCommentsVisible && activeProfile) {
      const fetchComments = async () => {
        const { data, error } = await supabase
          .from("replies")
          .select(
            "id, profile_id, post_id, content, media, timestamp, likes, dislikes, boosts, reshares, comments_count, username, profile_image_url, membership_tier"
          )
          .eq("post_id", post.id)
          .eq("profile_id", activeProfile.id); // Filter by activeProfile ID

        if (error) {
          console.error("Error fetching comments:", error.message);
          return;
        }

        setComments(data || []);
      };

      fetchComments();
    }
  }, [isCommentsVisible, post.id, activeProfile]);

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    router.push(`/post/${post.id}/image/${index + 1}`);
  };

  const closeImageModal = () => {
    setCurrentImageIndex(null);
    router.back();
  };

  const navigateImage = (direction: "next" | "prev") => {
    if (currentImageIndex === null) return;

    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % post.media.length
        : (currentImageIndex - 1 + post.media.length) % post.media.length;

    setCurrentImageIndex(newIndex);
    router.push(`/post/${post.id}/image/${newIndex + 1}`);
  };

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

  const handleReaction = async (type: "like" | "dislike") => {
    if (!activeProfile) {
      alert("You need to be logged in to interact with posts.");
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
      likes: isLike ? likes + 1 : likes,
      dislikes: !isLike ? dislikes + 1 : dislikes,
    };

    await supabase.from("posts").update(updatedReactions).eq("id", post.id);
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="post-media grid grid-cols-2 gap-2">
        {post.media.map((image, index) => (
          <div key={index} className="relative cursor-pointer" onClick={() => openImageModal(index)}>
            <Image src={image} alt={`Post media ${index + 1}`} width={250} height={250} className="rounded-lg" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        className={`post mb-6 p-4 border rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-gray-800"}`}
      >
        {profile && (
          <div className="post-header flex items-center justify-between mb-2">
            <div className="flex items-center">
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
                    <Image src="/icons/verified2.png" alt="Verified" width={16} height={16} className="ml-1" />
                  )}
                </span>
                <p className="text-sm text-gray-500">
                  @{profile.username} • {new Date(post.timestamp).toLocaleString()}
                </p>
                <p className="text-sm">{profile.links} Followers</p>
              </div>
            </div>
            {profile?.id === activeProfile?.id && (
            <div className="relative">
              <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute top-12 right-0 bg-gray-800 text-white p-2 rounded-lg shadow-lg">
                  <button className="block w-full text-left px-4 py-2" onClick={() => {/* Handle Edit */}}>
                    Edit
                  </button>
                  <button className="block w-full text-left px-4 py-2" onClick={() => {/* Handle Delete */}}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          </div>
        )}
        <p className="text-base mb-3">{post.content}</p>
        {renderMedia()}
        <div className="post-interactions flex justify-between mt-3">
          <button onClick={() => handleReaction("like")} className="interaction-button">
            👍 {likes}
          </button>
          <button onClick={() => handleReaction("dislike")} className="interaction-button">
            👎 {dislikes}
          </button>
          <button onClick={toggleCommentsVisibility} className="interaction-button">
            💬 {comments.length} Comments
          </button>
          <button onClick={handleReshare} className="interaction-button">
            🔁 {reshares} Reshares
          </button>
          <button onClick={handleBoost} className="interaction-button">
            🚀 {boosts} Boosts
          </button>
        </div>
        {isCommentsVisible && (
          <div className="comments-section mt-4">
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      {currentImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button className="absolute top-4 left-4 text-white text-2xl" onClick={closeImageModal}>
            ✖
          </button>
          <button className="absolute left-4 text-white text-2xl" onClick={() => navigateImage("prev")}>
            ◀
          </button>
          <div className="relative">
            <Image
              src={post.media[currentImageIndex]}
              alt={`Post media ${currentImageIndex + 1}`}
              width={800}
              height={800}
              className="rounded-lg"
            />
          </div>
          <button className="absolute right-4 text-white text-2xl" onClick={() => navigateImage("next")}>
            ▶
          </button>
        </div>
      )}
    </>
  );
};

export default Post;
