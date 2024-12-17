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
import { useAuthContext } from "./AuthContext";

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

interface PostContextType {
  posts: Post[];
  fetchPosts: () => Promise<void>;
  fetchProfile: (profileId: string) => Promise<Profile | null>;
  toggleOrHandleReaction: (postId: string, type: "likes" | "dislikes" | "boosts" | "reshares") => Promise<void>;
  fetchComments: (postId: string) => Promise<Comment[]>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { activeProfile, walletAddress, profiles, isConnected } = useAuthContext();

  // Function to log Supabase session and authenticated user
  const logSupabaseAuthSession = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching Supabase auth session:", error.message);
        return;
      }

      console.log("Supabase Authenticated User:", user);
      console.log("User Metadata:", user?.user_metadata);
      console.log("Session Status: Authenticated:", !!user);
    } catch (error) {
      console.error("Error logging Supabase session:", error);
    }
  }, []);

  // Log values from AuthContext and Supabase session
  useEffect(() => {
    console.log("Logging values from AuthContext in PostContext:");
    console.log("activeProfile:", activeProfile);
    console.log("walletAddress:", walletAddress);
    console.log("profiles:", profiles);
    console.log("isConnected:", isConnected);

    logSupabaseAuthSession();
  }, [activeProfile, walletAddress, profiles, isConnected, logSupabaseAuthSession]);

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

  // Realtime updates for posts
  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
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
      console.log("Updating reaction and post counts...");
      console.log("Post ID:", postId);
      console.log("Reaction Type:", type);
      console.log("Profile ID:", profileId);
  
      // Step 1: Check for existing reaction
      const { data: existingReaction, error: fetchError } = await supabase
        .from("reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("profile_id", profileId)
        .single();
  
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing reaction:", fetchError.message);
        return;
      }
  
      let newReactionValue = 1;
  
      if (existingReaction) {
        // Toggle the reaction: 1 -> 0, or 0 -> 1
        newReactionValue = existingReaction[type] === 1 ? 0 : 1;
  
        // Update existing reaction
        await supabase
          .from("reactions")
          .update({ [type]: newReactionValue })
          .eq("id", existingReaction.id);
      } else {
        // Insert a new reaction
        const newReaction = {
          post_id: postId,
          profile_id: profileId,
          [type]: 1,
        };
        await supabase.from("reactions").insert(newReaction);
      }
  
      console.log("Reaction updated. Now updating posts table...");
  
      // Step 2: Directly update the posts table with the same value
      await supabase.rpc("increment_post_reactions", {
        post_id_input: postId,
        column_name: type,
        increment_value: newReactionValue === 1 ? 1 : -1, // Add 1 or subtract 1
      });
  
      console.log("Posts table updated successfully.");
    } catch (error) {
      console.error("Error toggling reaction and updating post counts:", error);
    }
  };
  
  

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PostContext.Provider
      value={{ posts, fetchPosts, fetchProfile, fetchComments, toggleOrHandleReaction }}
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
