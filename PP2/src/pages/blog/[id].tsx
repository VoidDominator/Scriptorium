"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { remark } from "remark";
import html from "remark-html";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flag } from "lucide-react";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";


interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  rating: number,
}

interface BlogPost {
  id: string;
  title: string;
  content: string; // Markdown content
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string };
  thumbsUp: number;
  thumbsDown: number;
  rating: number;
  tags: { name: string }[];
  templates?: { id: string; title: string; explaination:string; }[];
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
  const [reportingTarget, setReportingTarget] = useState<{ postId?: string; commentId?: string } | null>(null);
  const [reportReason, setReportReason] = useState(""); // Report reason
  const [voteState, setVoteState] = useState({
    postUpvoted: false,
    postDownvoted: false,
  });
  const router = useRouter();
  const { id, page, title, tag, author, sortBy } = router.query;

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
        setError("Blog does not exist or hidden by Adminstrator!");
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

  const handleVote = async (type: "upvote" | "downvote", commentId?: string) => {
    if (!user) {
      router.push("/users/signin");
      return;
    }
  
    try {
      const payload = commentId
        ? { commentId: Number(commentId), type }
        : { postId: Number(id), type };
  
      const response = await fetchWithAuthRetry("/api/votes/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.warn(errorData.error || "Failed to vote.");
        return;
      }
  
      const { thumbsUp, thumbsDown, rating, message } = await response.json();
  
      if (commentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, thumbsUp, thumbsDown, rating }
              : comment
          )
        );
      } else {
        setPost((prev) =>
          prev
            ? { ...prev, thumbsUp, thumbsDown, rating }
            : null
        );
      }
  
      // Apply animation effect
      const elementId = commentId ? `comment-${commentId}` : "post-rating";
      const element = document.getElementById(elementId);
  
      if (element) {
        if (type === "upvote") {
          element.classList.add("animate-bounce");
        } else if (type === "downvote") {
          element.classList.add("animate-wiggle");
        }
  
        // Remove animation class after effect
        setTimeout(() => {
          element.classList.remove("animate-bounce", "animate-wiggle");
        }, 500);
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };
  
  const handleAddComment = async () => {
    if (!user) {
      router.push("/users/signin");
      return;
    }

    if (!commentContent.trim()) return;

    try {
      const response = await fetchWithAuthRetry("/api/blog-comment", {
        method: "POST",
        body: JSON.stringify({
          content: commentContent,
          postId: id,
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

  const handleReport = async (commentId?: string) => {
    if (!user) {
      router.push("/users/signin");
      return;
    }
  
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }
  
    try {
      const response = await fetchWithAuthRetry("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: commentId ? undefined : id, // Report the post if no commentId is passed
          commentId,
          reason: reportReason,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to report content.");
      }
  
      alert("Report submitted successfully.");
      setReportReason(""); // Clear the input field
      setReportingTarget(null); // Close the modal
    } catch (err) {
      console.error("Error reporting content:", err);
      alert("An error occurred while submitting your report.");
    }
  };
  
  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchComments(pagination.currentPage + 1);
    }
  };

  const handleBackToSearch = () => {
    // Navigate back to the search page with the same query parameters
    router.push({
      pathname: "/blog-post/",
      query: router.query, // Use the same query parameters
    });
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      {post && (
        <div className="max-w-4xl mx-auto">

          {/* Back to Search Results Button
          <Button onClick={handleBackToSearch} className="flex justify-start">
              <ArrowLeft className="mr-2" />
              Back to Search Results
            </Button> */}

          {/* Title and Author */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Released on {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-4 overflow-hidden rounded-full border">
                <AvatarImage
                  src={post?.user?.avatar || "/default-avatar.png"}
                  alt="Author Avatar"
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>
                  {post.user?.firstName?.[0] || "?"}
                  {post.user?.lastName?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">
                {post?.user?.firstName || "Unknown"} {post?.user?.lastName || "User"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Render HTML Content */}
          <div
            className="markdown my-6 text-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Blog Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="my-4">
              <div className="flex flex-wrap mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Display templates linked to the blog post */}
          {post.templates && post.templates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Templates</h2>
              <div className="space-y-3">
                {post.templates.map((template) => (
                  <HoverCard key={template.id}>
                    <HoverCardTrigger asChild>
                      <a
                        href={`/editor/${template.id}`}
                        className="text-blue-500 hover:underline block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {template.title}
                      </a>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 bg-white shadow-lg p-3 rounded-md border border-gray-300">
                      <p className="text-sm text-gray-800">{template.explaination || "No explanation available"}</p>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          )}


          {/* Voting and Rating */}
          <div id="post-rating" className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => handleVote("upvote")}
            >
              ▲
            </Button>
            <p className="mx-2">{post?.rating || 0}</p>
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => handleVote("downvote")}
            >
              ▼
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setReportingTarget({ postId: Array.isArray(id) ? id[0] : id })
              }
              className="flex items-center ml-auto"
            >
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
                  <div className="flex items-start space-x-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => handleVote("upvote", comment.id)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        ▲
                      </button>
                      <p className="text-lg">{comment.rating}</p>
                      <button
                        onClick={() => handleVote("downvote", comment.id)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1">
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
                        {/* Report Flag */}
                      <Button
                        variant="ghost"
                        onClick={() => setReportingTarget({ commentId: comment.id })}
                        className="flex items-center"
                      >
                        <Flag className="h-4 w-4" />
                        Report
                      </Button>
                      </div>
                    </div>
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
          {reportingTarget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white dark:bg-black p-6 rounded-md shadow-lg max-w-sm w-full border">
                <h2 className="text-lg font-semibold mb-4">Report Content</h2>
                <Textarea
                  placeholder="Enter your reason for reporting"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-4 mt-4">
                  <Button variant="secondary" onClick={() => setReportingTarget(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleReport(reportingTarget.commentId)}>
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}






          
        </div>
      )}
    </div>
  );
}
