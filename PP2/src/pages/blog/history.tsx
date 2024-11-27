"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry"; // Import helper function

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: { name: string }[];
  isDeleting?: boolean;
}

export default function BlogHistoryPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 9,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserPosts = async (page = 1) => {
    try {
      setError(null);

      const response = await fetchWithAuthRetry(
        `/api/blog-post/searchmine?page=${page}&limit=${pagination.pageSize}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user blog posts.");
      }

      const data = await response.json();

      setPosts(data.posts);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.pagination.totalPages,
        currentPage: data.pagination.currentPage,
        totalItems: data.pagination.totalItems,
      }));
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setError("Failed to load blog posts. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [pagination.pageSize]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchUserPosts(page);
  };

  const handleEdit = (postId: string) => {
    router.push(`/blog/edit/${postId}`);
  };

  const handleDelete = async (postId: string) => {
    console.log("Attempting to delete post with ID:", postId);
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );
  
    if (!confirmed) {
      return; // Exit if the user cancels
    }
  
    try {
      // Disable button during delete operation (optional UI feedback)
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isDeleting: true } : post
        )
      );
  
      const response = await fetchWithAuthRetry(`/api/blog-post/${postId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete the blog post.");
      }
  
      alert("Deleted successfully!");
  
      // Refetch posts after deletion
      fetchUserPosts(pagination.currentPage);
    } catch (err) {
      console.error("Error deleting blog post:", err);
      setError("Failed to delete the blog post. Please try again.");
    } finally {
      // Reset button state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isDeleting: false } : post
        )
      );
    }
  };
  
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Blog Posts</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="h-64 flex flex-col justify-between border shadow-lg">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
              <div className="text-muted">
                {post.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full mr-2"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => handleEdit(post.id)} variant="secondary">
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(post.id)}
                variant="destructive"
                disabled={post.isDeleting} // Disable button while deleting
                >
                {post.isDeleting ? "Deleting..." : "Delete"}
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Pagination className="mt-8">
        <PaginationContent>
          {pagination.currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pagination.currentPage - 1);
                }}
              />
            </PaginationItem>
          )}
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(i + 1);
                }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {pagination.currentPage < pagination.totalPages && (
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pagination.currentPage + 1);
                }}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
