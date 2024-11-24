"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/router";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogPost {
  id: string;
  title: string;
  tags: { name: string }[];
  user: { firstName: string; lastName: string };
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [searchParams, setSearchParams] = useState({
    title: "",
    tag: "",
    author: "",
    sortBy: "rating",
  });
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hydrated, setHydrated] = useState(false); // Track hydration
  const router = useRouter();

  // Ensures content is rendered only after hydration
  useEffect(() => {
    setHydrated(true);

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

  const fetchPosts = async (page = 1) => {
    try {
      setError(null);
      const query = new URLSearchParams({
        ...searchParams,
        page: page.toString(),
        limit: "12",
      });

      const response = await fetch(`/api/blog-post/search?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    }
  };

  useEffect(() => {
    if (hydrated) {
      fetchPosts();
    }
  }, [hydrated, searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, title: e.target.value });
  };

  const handleSortChange = (sortBy: string) => {
    setSearchParams({
      ...searchParams,
      sortBy,
      title: sortBy === "rating" ? "" : searchParams.title,
      tag: sortBy === "tags" ? searchParams.tag : "",
      author: sortBy === "author" ? searchParams.author : "",
    });
  };

  const goToPost = (postId: string) => {
    router.push(`/blog/${postId}`);
  };

  const createPost = () => {
    router.push("/blog/create");
  };

  const handlePageChange = async (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    await fetchPosts(page);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="mr-2">Sort By</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange("rating")}>Rating</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("tags")}>Tags</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("author")}>Author</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Search blog posts..."
          value={searchParams.title}
          onChange={handleSearch}
          className="flex-1 mr-2"
        />
        <Button onClick={() => fetchPosts(1)}>Search</Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {posts.map((post) => (
          <Card
            key={post.id}
            onClick={() => goToPost(post.id)}
            className="cursor-pointer hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted mb-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full mr-2"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Author: {post.user.firstName} {post.user.lastName}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination>
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

      {hydrated && user && (
        <div className="flex justify-center items-center mt-12">
          <Button onClick={createPost}>Publish Blog Post</Button>
        </div>
      )}
    </div>
  );
}
