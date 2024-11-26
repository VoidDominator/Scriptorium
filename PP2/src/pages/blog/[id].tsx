"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { remark } from "remark";
import html from "remark-html";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface BlogPost {
  id: string;
  title: string;
  content: string; // Markdown content
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string };
  thumbsUp: number;
  thumbsDown: number;
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // Logged-in user info
  const [reporting, setReporting] = useState(false); // Report modal state
  const [reportReason, setReportReason] = useState(""); // Report reason
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuthRetry("/api/users/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.warn("No logged-in user detected. Visitors can view the post.");
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

        // Convert Markdown content to HTML using remark
        const processedContent = await remark()
          .use(html)
          .process(data.content);
        setHtmlContent(processedContent.toString());
      } catch (err) {
        setError("Failed to load the blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const fetchComments = async (page = 1) => {
    setCommentLoading(true);

    try {
      const response = await fetch(`/api/blog-comment?postId=${id}&page=${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments.");
      }

      const data = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  const handleVote = async (type: "up" | "down", commentId?: string) => {
    if (!user) {
      router.push("/users/signin");
      return;
    }

    try {
      const endpoint = commentId
        ? `/api/comments/${commentId}/vote`
        : `/api/blog-post/${id}/vote`;

      const response = await fetchWithAuthRetry(endpoint, {
        method: "POST",
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote.");
      }

      if (commentId) {
        fetchComments(pagination.currentPage); // Refresh comments
      } else {
        const updatedPost = await response.json();
        setPost(updatedPost);
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleReport = async (commentId?: string) => {
    if (!user) {
      router.push("/users/signin");
      return;
    }

    if (!reportReason.trim()) return;

    try {
      const response = await fetchWithAuthRetry("/api/report", {
        method: "POST",
        body: JSON.stringify({
          postId: commentId ? undefined : id,
          commentId,
          reason: reportReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to report content.");
      }

      setReporting(false);
      setReportReason("");
      alert("Content has been reported successfully.");
    } catch (err) {
      console.error("Error reporting content:", err);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      router.push("/users/signin");
      return;
    }

    if (!id) {
      console.error("Post ID is missing.");
      alert("Cannot add a comment without a valid post.");
      return;
    }

    if (!commentContent.trim()) return;

    try {
      const postId = String(id);
  
      const response = await fetchWithAuthRetry("/api/blog-comment", {
        method: "POST",
        body: JSON.stringify({
          content: commentContent,
          postId, // Ensure postId is included and valid
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment.");
      }

      setCommentContent(""); // Clear the input
      fetchComments(1); // Refresh comments
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchComments(pagination.currentPage + 1);
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
              <Avatar className="h-10 w-10 mr-4 overflow-hidden rounded-full border">
                <AvatarImage
                  src={post.user.avatar}
                  alt="Author Avatar"
                  className="h-full w-full object-cover"
                />
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

          {/* Render HTML Content */}
          <div
            className="markdown my-6 text-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Voting and Reporting */}
          <div className="flex items-center mt-4 space-x-4">
            <Button variant="ghost" className="flex items-center" onClick={() => handleVote("up")}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              {post.thumbsUp}
            </Button>
            <Button variant="ghost" className="flex items-center" onClick={() => handleVote("down")}>
              <ThumbsDown className="mr-2 h-4 w-4" />
              {post.thumbsDown}
            </Button>
            <Button variant="ghost" className="flex items-center ml-auto" onClick={() => setReporting(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>

            {/* Add Comment */}
            <Textarea
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <Button onClick={handleAddComment} disabled={!commentContent.trim()}>
              {user ? "Post Comment" : "Log in to Comment"}
            </Button>

            {/* Comments List */}
            {commentLoading ? (
              <p className="mt-4 text-center">Loading comments...</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-4 overflow-hidden rounded-full">
                        <AvatarFallback>
                          {comment.user.firstName[0]}
                          {comment.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-muted-foreground">
                        {comment.user.firstName} {comment.user.lastName}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button variant="ghost" onClick={() => handleVote("up", comment.id)}>
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleVote("down", comment.id)}>
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleReport(comment.id)}>
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}



            {/* Load More Button */}
            {pagination.currentPage < pagination.totalPages && (
              <Button onClick={handleLoadMore} className="mt-4">
                Load More Comments
              </Button>
            )}
          </div>

          {/* Report Modal */}
          {reporting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4">Report Post</h2>
                <Textarea
                  placeholder="Enter your reason for reporting"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-4 mt-4">
                  <Button variant="secondary" onClick={() => setReporting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleReport()}>Submit</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
