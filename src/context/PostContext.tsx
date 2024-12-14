"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "../utils/supaBaseClient";
import { useAuthContext } from "../context/AuthContext";

interface Post {
  id: string;
  author_profile_id: string;
  content: string;
  media_links: string[];
  timestamp: string;
  likes: number;
  dislikes: number;
  boosts: number;
  reshares: number;
}

interface Profile {
  id: string;
  display_name: string;
  username: string;
  profile_image: string;
  verified: boolean;
}

interface RealtimePayload {
    new: {
      id: string;
      likes: number;
      dislikes: number;
    };
  }
  

interface PostContextType {
  posts: Post[];
  fetchPosts: () => Promise<void>;
  fetchProfile: (profileId: string) => Promise<Profile | null>;
  toggleOrHandleReaction: (postId: string, type: "likes" | "dislikes"| "boosts" | "reshares") => Promise<void>;
  fetchComments: (postId: string) => Promise<Comment[]>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { activeProfile } = useAuthContext();

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("posts").select("*");

      if (error) throw new Error(error.message);

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  // Fetch a single profile
  const fetchProfile = useCallback(
    async (profileId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, username, profile_image, membership_tier")
          .eq("id", profileId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return null;
        }

        return {
          id: data.id,
          display_name: data.display_name,
          username: data.username,
          profile_image: data.profile_image || "/default-avatar.png",
          verified: data.membership_tier === "verified",
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    []
  );

   // Fetch comments for a post
   const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("parent_id", postId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error.message);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

useEffect(() => {
  // Create a real-time channel for updates to the 'posts' table
  const channel = supabase
    .channel('posts-realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'posts' },
      (payload) => {
        const updatedPost = payload.new;
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost.id
              ? {
                  ...post,
                  likes: updatedPost.likes,
                  dislikes: updatedPost.dislikes,
                }
              : post
          )
        );
      }
    )
    .subscribe();

  // Clean up the subscription on component unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

const toggleOrHandleReaction = async (
  postId: string,
  type: "likes" | "dislikes" | "boosts" | "reshares"
) => {
  if (!activeProfile) {
    alert("You need to log in to interact with posts.");
    return;
  }

  const profileId = activeProfile.id;

  try {
    // Fetch existing reaction for the post by the current user
    const { data: existingReaction, error } = await supabase
      .from("reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("profile_id", profileId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching reaction:", error.message);
      return;
    }

    if (!existingReaction) {
      // Insert new reaction
      const newReaction = {
        post_id: postId,
        profile_id: profileId,
        [type]: 1, // Set the specified type (like, dislike, boost, reshare)
        ...(type === "likes" && { dislikes: 0 }), // Ensure mutual exclusivity
        ...(type === "dislikes" && { likes: 0 }), // Ensure mutual exclusivity
      };
      await supabase.from("reactions").insert(newReaction);
    } else {
      // Update existing reaction
      const updatedReaction = {
        [type]: existingReaction[type] === 1 ? 0 : 1, // Toggle the type
        ...(type === "likes" && { dislikes: 0 }), // Ensure mutual exclusivity
        ...(type === "dislikes" && { likes: 0 }), // Ensure mutual exclusivity
      };

      await supabase
        .from("reactions")
        .update(updatedReaction)
        .eq("id", existingReaction.id);
    }
  } catch (error) {
    console.error(`Error toggling ${type}:`, error);
  }
};




  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PostContext.Provider
      value={{ posts, fetchPosts, fetchProfile, fetchComments , toggleOrHandleReaction }}
    >
      {children}
    </PostContext.Provider>
  );
};



export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
