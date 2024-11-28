"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"; // Import HoverCard components
import { useRouter } from "next/router";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BlogPost {
  id: string;
  title: string;
  description: string; // Added description to the BlogPost type
  tags: { name: string }[];
  user: { firstName: string; lastName: string };
  releaseTime: string; // Assuming the release time is provided as a string
  rating: number; // Assuming ratings is a number
  createdAt: string;
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 9,
  });
  const [searchParams, setSearchParams] = useState({
    title: "",
    content: "",
    tag: "",
    template: "",
    sortBy: "rating",
    order: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeField, setActiveField] = useState<"tag" | "content" | "title" | "template">("title"); // Default to "title"
  const router = useRouter();

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

  const fetchPosts = async (page = 1) => {
    const { title, content, tag, template, sortBy, order } = searchParams;
    const limit = pagination.pageSize;

    try {
      setError(null);

      // Construct query parameters
      const queryParams = new URLSearchParams({
        title: title || "",
        content: content || "",
        tag: tag || "",
        template: template || "",
        sortBy: sortBy || "rating",
        order: order || "desc",
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/blog-post/search?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts.");
      }

      const data = await response.json();

      setPosts(data.posts);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
        currentPage: data.pagination.currentPage,
      }));
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams, pagination.pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams((prev) => ({
      ...prev,
      [activeField]: value, // Dynamically update the active field
    }));
  };

  const handleSortChange = (sortBy: string, direction: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: "rating",
      order: direction,
    }));
    // Do not call fetchPosts directly here; let useEffect handle it
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size }));
    fetchPosts(1); // Reset to the first page whenever page size changes
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
        <SidebarTrigger className="h-10 w-10 text-lg"/>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="mr-2">Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Sorting options */}
            <DropdownMenuItem onClick={() => handleSortChange("rating", "desc")}>
              Rating (High to Low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("rating", "asc")}>
              Rating (Low to High)
            </DropdownMenuItem>

            {/* Field selection options */}
            <DropdownMenuItem
              onClick={() => {
                setActiveField("tag");
                setSearchParams((prev) => ({
                  ...prev,
                  tag: "",
                }));
              }}
            >
              Tags
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActiveField("title");
                setSearchParams((prev) => ({
                  ...prev,
                  title: "",
                }));
              }}
            >
              Title
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActiveField("content");
                setSearchParams((prev) => ({
                  ...prev,
                  content: "",
                }));
              }}
            >
              Content
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActiveField("template");
                setSearchParams((prev) => ({
                  ...prev,
                  template: "",
                }));
              }}
            >
              Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder={`Search by ${activeField}...`}
          value={searchParams[activeField] || ""}
          onChange={handleSearchChange}
          className="flex-1 mr-2"
        />

        <Button onClick={() => fetchPosts(1)}>Search</Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="ml-2">Page Size</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[3, 6, 9, 12, 15].map((size) => (
              <DropdownMenuItem key={size} onClick={() => handlePageSizeChange(size)}>
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {posts.map((post) => (
          <HoverCard key={post.id}>
            <HoverCardTrigger>
              <Card
                onClick={() => goToPost(post.id)}
                className="cursor-pointer hover:shadow-lg h-48 flex flex-col justify-between"
              >
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2 line-clamp-2">{post.description}</p>
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
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p>
                <strong>Author:</strong> {post.user.firstName} {post.user.lastName}
              </p>
              <p>
                <strong>Release Time:</strong> {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Ratings:</strong> {post.rating}
              </p>
            </HoverCardContent>
          </HoverCard>
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

      {user && (
        <div className="flex justify-center items-center mt-12">
          <Button onClick={createPost}>Publish Blog Post</Button>
        </div>
      )}
    </div>
  );
}
