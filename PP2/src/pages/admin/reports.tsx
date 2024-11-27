"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@radix-ui/react-hover-card";

interface ReportedContent {
  id: string;
  title?: string; // For posts
  content: string; // For posts or comments
  user: { firstName: string; lastName: string; email: string; avatar: string };
  reports: { reason: string; createdAt: string }[];
  hidden: boolean;
  postId?: string; // Included for comments
}

export default function AdminReportsPage() {
  const [reportedPosts, setReportedPosts] = useState<ReportedContent[]>([]);
  const [reportedComments, setReportedComments] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetchReports = async () => {
      try {
        const userResponse = await fetchWithAuthRetry("/api/users/me");
        if (!userResponse.ok) {
          router.replace("/users/signin");
          return;
        }
        
        const userData = await userResponse.json();
        if (userData.role !== "ADMIN") {
          router.replace("/");
          return;
        }

        setLoading(true);

        const reportsResponse = await fetchWithAuthRetry("/api/admin/reports");
        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch reports");
        }

        const { posts, comments } = await reportsResponse.json();
        setReportedPosts(posts);
        setReportedComments(comments);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchReports();
  }, [router]);

  const handleVisibilityChange = async (type: "post" | "comment", id: string, hidden: boolean) => {
    try {
      const response = await fetchWithAuthRetry("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [`${type}Id`]: id,
          hidden,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const updatedContent = await response.json();
      if (type === "post") {
        setReportedPosts((prev) =>
          prev.map((post) => (post.id === id ? { ...post, hidden: updatedContent.hidden } : post))
        );
      } else {
        setReportedComments((prev) =>
          prev.map((comment) => (comment.id === id ? { ...comment, hidden: updatedContent.hidden } : comment))
        );
      }
    } catch (err) {
      console.error("Error updating visibility:", err);
      setError("Failed to update visibility. Please try again.");
    }
  };

  const redirectToContent = (type: "post" | "comment", id: string, postId?: string) => {
    if (type === "post") {
      router.push(`/blog/${id}`);
    } else if (type === "comment" && postId) {
      router.push(`/blog/${postId}`);
    } else {
      console.warn("Unable to determine the target post for the comment");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reported Content</h1>
      <Separator className="mb-6" />

      {/* Reported Blog Posts */}
      <h2 className="text-xl font-semibold mb-4">Reported Blog Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportedPosts.map((post) => (
          <HoverCard key={post.id}>
            <HoverCardTrigger asChild>
              <Card
                className="h-64 flex flex-col justify-between border shadow-lg"
                onClick={() => redirectToContent("post", post.id)}
              >
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                  <p className="text-xs text-gray-500">
                    Reported {post.reports.length} times
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityChange("post", post.id, !post.hidden);
                    }}
                  >
                    {post.hidden ? "Unhide" : "Hide"}
                  </Button>
                </CardFooter>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent>
              <h3 className="text-sm font-semibold mb-2">Report Reasons</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                {post.reports.map((report, index) => (
                  <li key={index}>
                    - {report.reason} <span className="text-gray-500">({new Date(report.createdAt).toLocaleString()})</span>
                  </li>
                ))}
              </ul>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>

      {/* Reported Comments */}
      <h2 className="text-xl font-semibold mb-4">Reported Comments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportedComments.map((comment) => (
          <HoverCard key={comment.id}>
            <HoverCardTrigger asChild>
              <Card
                className="h-64 flex flex-col justify-between border shadow-lg"
                onClick={() => redirectToContent("comment", comment.id, comment.postId)}
              >
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{comment.content}</p>
                  <p className="text-xs text-gray-500">
                    Reported {comment.reports.length} times
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityChange("comment", comment.id, !comment.hidden);
                    }}
                  >
                    {comment.hidden ? "Unhide" : "Hide"}
                  </Button>
                </CardFooter>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent>
              <h3 className="text-sm font-semibold mb-2">Report Reasons</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                {comment.reports.map((report, index) => (
                  <li key={index}>
                    - {report.reason} <span className="text-gray-500">({new Date(report.createdAt).toLocaleString()})</span>
                  </li>
                ))}
              </ul>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
