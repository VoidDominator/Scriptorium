"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import debounce from "lodash/debounce";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = router.query; // Get the blog post ID from the URL
  const [user, setUser] = useState<any>(null); // Store logged-in user info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(""); // Store raw Markdown
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [templates, setTemplates] = useState([]); // Templates from search
  const [linkedTemplates, setLinkedTemplates] = useState<any[]>([]); // Templates already linked to the blog post
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]); // Templates selected by the user
  const [templateSearchQuery, setTemplateSearchQuery] = useState(""); // Query for template search
  const [templateLoading, setTemplateLoading] = useState(false); // Loading state for templates


  const TITLE_MAX_LENGTH = 34;
  const DESCRIPTION_MAX_LENGTH = 50;
  const TAG_MAX_LENGTH = 10;

  // Fetch existing blog post data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await fetchWithAuthRetry(`/api/blog-post/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch blog post data.");
        }
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
        setTags(data.tags.map((tag: { name: string }) => tag.name));
      } catch (err) {
        console.error(err);
        setError("Failed to load blog post data. Please try again.");
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!id) return;
  
    const fetchLinkedTemplates = async () => {
      try {
        const response = await fetchWithAuthRetry(`/api/blog-post/${id}`);
        if (!response.ok) throw new Error("Failed to fetch linked templates.");
  
        const data = await response.json();
        setLinkedTemplates(data.templates || []);
        setSelectedTemplates((data.templates || []).map((template: any) => template.id));
      } catch (err) {
        console.error("Error fetching linked templates:", err);
      }
    };
  
    fetchLinkedTemplates();
  }, [id]);

  const fetchTemplates = debounce(async () => {
    setTemplateLoading(true);
    try {
      const response = await fetch(`/api/templates?title=${templateSearchQuery}&itemPerPage=10`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setTemplateLoading(false);
    }
  }, 300);
  
  useEffect(() => {
    if (templateSearchQuery !== "") {
      fetchTemplates();
    }
  }, [templateSearchQuery]);
  
  const handleTemplateSelection = (templateId: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId) // Unselect if already selected
        : [...prev, templateId]
    );
  };
  

  const handleAddTag = () => {
    if (newTag.length > TAG_MAX_LENGTH) {
      setError(`Each tag must not exceed ${TAG_MAX_LENGTH} characters.`);
      return;
    }

    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const updateTemplatesForBlogPost = async (blogPostId: string, templateIds: number[]) => {
    try {
      const response = await fetchWithAuthRetry(`/api/blog-post/${blogPostId}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIds }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update templates.");
      }
    } catch (err) {
      console.error("Error updating templates:", err);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    if (title.length > TITLE_MAX_LENGTH) {
      setError(`Title must not exceed ${TITLE_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setError(`Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuthRetry(`/api/blog-post/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, content, tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update the blog post.");
      }

      await updateTemplatesForBlogPost(String(id), selectedTemplates);

      router.push(`/blog/history`);
    } catch (err) {
      setError("Failed to update the blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl"> <SidebarTrigger className="h-10 w-10 text-lg"/> Edit Blog Post</CardTitle>
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
            <p className="text-sm text-gray-500">
              {title.length} / {TITLE_MAX_LENGTH}
            </p>
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
            <p className="text-sm text-gray-500">
              {description.length} / {DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          <div>
            <Label htmlFor="content" className="mb-1">
              Content (Markdown Supported)
            </Label>
            <Textarea
              id="content"
              placeholder="Write your blog post content in markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
            />
            <Button
              variant="ghost"
              onClick={() => setPreviewMode(!previewMode)}
              className="mt-2"
            >
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
            {previewMode && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
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
        <div className="space-y-4 px-4">
          <Label htmlFor="template-search" className="mb-1">
            Link Templates
          </Label>
          <Input
            id="template-search"
            placeholder="Search for templates"
            value={templateSearchQuery}
            onChange={(e) => setTemplateSearchQuery(e.target.value)}
          />
          {templateLoading ? (
            <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Display currently linked templates */}
              <div>
                <h3 className="font-semibold mb-2">Currently Linked Templates:</h3>
                {linkedTemplates.map((template: any) => (
                  <div key={template.id} className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleTemplateSelection(template.id)}
                    />
                    <span>{template.title}</span>
                  </div>
                ))}
              </div>

              {/* Display search results */}
              <div>
                <h3 className="font-semibold mb-2">Search Results:</h3>
                {templates.map((template: any) => (
                  <div key={template.id} className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleTemplateSelection(template.id)}
                    />
                    <span>{template.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Separator />



        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading || !title || !description || !content}
            className="w-full md:w-auto"
          >
            {loading ? "Updating..." : "Update Blog Post"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
