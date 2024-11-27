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
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: { name: string }[];
}

export default function StarredPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 9,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStarredPosts = async (page = 1) => {
    try {
      setError(null);

      const response = await fetchWithAuthRetry(
        `/api/blog-post/starred?page=${page}&limit=${pagination.pageSize}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch starred blog posts.");
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
      console.error("Error fetching starred posts:", err);
      setError("Failed to load starred blog posts. Please try again.");
    }
  };

  useEffect(() => {
    fetchStarredPosts();
  }, [pagination.pageSize]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchStarredPosts(page);
  };

  const goToBlog = (postId: string) => {
    router.push(`/blog/${postId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Starred Blog Posts</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="h-64 flex flex-col justify-between border shadow-lg"
            onClick={() => goToBlog(post.id)}
          >
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
