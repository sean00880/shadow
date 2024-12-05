"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supaBaseClient";
import Post from "../../../components/Post";

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query; // Fetch the dynamic ID from the route
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

        if (error) throw error;

        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error.message);
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
