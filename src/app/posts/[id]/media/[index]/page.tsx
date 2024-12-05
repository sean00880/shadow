import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../../../../utils/supaBaseClient";
import Comment from "../../../../../components/Comment";

interface MediaPageProps {
  params: { id: string; index: string }; // Ensure params includes id and index as strings
}

interface PostMediaProps {
  id: string;
  media_links: string[];
}

interface CommentProps {
  id: string;
  profile_id: string;
  parent_id: string | null;
  content: string;
  media_links?: string[];
  timestamp: string;
  likes: number;
  dislikes: number;
  username: string;
  profile_image_url: string;
  membership_tier: string;
}

const MediaPage: React.FC<MediaPageProps> = ({ params }) => {
  const { id, index } = params;
  const [post, setPost] = useState<PostMediaProps | null>(null);
  const [currentMedia, setCurrentMedia] = useState<{ id: string; postId: string; url: string } | null>(
    null
  );
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || index === undefined) return;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, media_links")
          .eq("id", id)
          .single();

        if (error) throw error;

        setPost(data);
        const mediaUrl = data.media_links?.[parseInt(index)];
        if (mediaUrl) {
          setCurrentMedia({ id: `${id}-${index}`, postId: id, url: mediaUrl });
        } else {
          console.error("Media not found for the specified index.");
        }
      } catch (err) {
        console.error("Error fetching post or media:", err instanceof Error ? err.message : err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, index]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            "*, profile:profiles(id, display_name, username, profile_image, membership_tier)"
          )
          .eq("parent_id", id)
          .order("timestamp", { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error("Error fetching comments:", err instanceof Error ? err.message : err);
      }
    };

    fetchComments();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post || !currentMedia) return <div>Media not found</div>;

  return (
    <div className="media-page min-h-screen bg-light-background text-white font-sans">
      <div className="media-container max-w-3xl mx-auto p-4">
        <div className="media-viewer mb-4">
          <Image
            src={currentMedia.url}
            alt={`Media for post ${id}`}
            width={800}
            height={800}
            className="rounded-lg"
          />
        </div>
        <div className="comments-section mt-6">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaPage;
