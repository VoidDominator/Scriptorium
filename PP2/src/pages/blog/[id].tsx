"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string };
  comments: {
    id: string;
    content: string;
    thumbsUp: number;
    thumbsDown: number;
    user: { firstName: string; lastName: string; avatar: string };
  }[];
  thumbsUp: number;
  thumbsDown: number;
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [user, setUser] = useState<any>(null); // Logged-in user info
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/blog-post/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch the blog post.");
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError("Failed to load the blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/users/signin");
        return;
      }

      const response = await fetch(`/api/blog-post/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment.");
      }

      const newComment = await response.json();
      setPost((prev) => ({
        ...prev!,
        comments: [...prev!.comments, newComment],
      }));
      setCommentContent("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      {post && (
        <div className="max-w-4xl mx-auto">
          {/* Title and Author */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Released on {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={post.user.avatar} alt="Author Avatar" />
                <AvatarFallback>
                  {post.user.firstName[0]}
                  {post.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">
                {post.user.firstName} {post.user.lastName}
              </p>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="my-6 text-lg">{post.content}</div>

          <Separator />

          {/* Thumbs Up and Thumbs Down */}
          <div className="flex items-center mt-4 space-x-4">
            <Button variant="ghost" className="flex items-center">
              <ThumbsUp className="mr-2 h-4 w-4" />
              {post.thumbsUp}
            </Button>
            <Button variant="ghost" className="flex items-center">
              <ThumbsDown className="mr-2 h-4 w-4" />
              {post.thumbsDown}
            </Button>
            <Button variant="ghost" className="flex items-center ml-auto">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>

          <Separator />

          {/* Comments */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>
            {post.comments.map((comment) => (
              <div key={comment.id} className="mb-6">
                <div className="flex items-center mb-2">
                  <Avatar className="h-8 w-8 mr-4">
                    <AvatarImage src={comment.user.avatar} alt="Commenter Avatar" />
                    <AvatarFallback>
                      {comment.user.firstName[0]}
                      {comment.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">
                    {comment.user.firstName} {comment.user.lastName}
                  </p>
                </div>
                <p className="mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" className="flex items-center">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    {comment.thumbsUp}
                  </Button>
                  <Button variant="ghost" className="flex items-center">
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    {comment.thumbsDown}
                  </Button>
                  <Button variant="ghost" className="flex items-center ml-auto">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          {user && (
            <div className="mt-6">
              <Textarea
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button
                className="mt-2"
                onClick={handleCommentSubmit}
                disabled={!commentContent.trim()}
              >
                Post Comment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
