"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // New description field
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token missing. Please log in again.");
      }

      const response = await fetch("/api/users/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      }
      throw new Error("Access token missing in refresh response");
    } catch (err) {
      setError("Session expired. Please log in again.");
      router.push("/users/signin");
      throw err;
    }
  };

  const fetchWithAuthRetry = async (url: string, options = {}) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token missing. Please log in again.");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...((options as any).headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        return fetch(url, {
          ...options,
          headers: {
            ...((options as any).headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      return response;
    } catch (err) {
      setError("An error occurred. Please try again.");
      throw err;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetchWithAuthRetry("/api/users/me");
        if (!response.ok) {
          throw new Error("Failed to verify user");
        }

        const userData = await response.json();
        setUser(userData);
      } catch {
        router.push("/users/signin");
      }
    };

    checkUser();
  }, []);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token is missing. Please log in again.");
      }

      const response = await fetchWithAuthRetry("/api/blog-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title, description, content, tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to create the blog post.");
      }

      router.push("/blog/blog-post");
    } catch (err) {
      setError("Failed to create the blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create a Blog Post</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <Label htmlFor="title" className="mb-1">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter your blog post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="mb-1">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter a brief description of your blog post"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="content" className="mb-1">
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="Write your blog post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="tags" className="mb-1">
              Tags
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="mt-2 space-x-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading || !title || !description || !content}
            className="w-full md:w-auto"
          >
            {loading ? "Publishing..." : "Publish Blog Post"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
