"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Correct hook for dynamic parameters
import { supabase } from "../../../utils/supaBaseClient";
import Post from "../../../components/Post";

const PostPage = () => {
  const { id } = useParams(); // Use useParams to fetch the dynamic ID
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            *,
            profile:profiles(id, display_name, username, profile_image, membership_tier)
            `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching post:", (error as Error).message);
          return;
        }

        setPost(data);
      } catch (err) {
        console.error("Unexpected error:", err instanceof Error ? err.message : err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return <Post post={post} isDarkMode={true} />;
};

export default PostPage;
