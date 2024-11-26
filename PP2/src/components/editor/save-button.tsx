import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Loader2 } from "lucide-react";

interface SaveTemplateButtonProps {
  template: {
    id?: number; // Make id optional
    title: string;
    explaination: string;
    tags: { id: number; name: string }[];
  };
  code: string;
}

export function SaveTemplateButton({ template, code }: SaveTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(template.title || "");
  const [explaination, setExplaination] = useState(template.explaination || "");
  const [tags, setTags] = useState(
    template.tags ? template.tags.map((tag) => tag.name).join(", ") : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const requestData = {
        title,
        explaination,
        tags,
        content: code,
      };

      let response;
      if (template.id) {
        // Update existing template
        response = await fetchWithAuthRetry(`/api/templates/${template.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new template
        response = await fetchWithAuthRetry(`/api/templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setOpen(false);
        if (template.id) {
          toast.success("Template saved successfully.");
          router.reload(); // Refresh the page to show updated data
        } else {
          toast.success(`Template "${title}" created successfully with ID ${data.templateId}.`);
          // Redirect to the new template's editor page
          router.push(`/editor/${data.templateId}`);
        }
      } else {
        toast.error(data.error || "Failed to save the template.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full">
              {template.id ? "Save..." : "Create..."}
            </Button>
          </DialogTrigger>
        </HoverCardTrigger>
        <HoverCardContent side="left" align="center" className="text-sm">
          {template.id ? (
            <span>
              Save changes to <span className="italic">{template.title}</span> with ID {template.id})
            </span>
          ) : (
            <span>Create a new template!</span>
          )}
        </HoverCardContent>
      </HoverCard>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template.id ? "Save Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            {template.id
              ? "Update the template details and save your changes."
              : "Enter the template details and create a new template."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Template Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="explaination">Explanation</Label>
            <Textarea
              id="explaination"
              placeholder="Template Explanation"
              value={explaination}
              onChange={(e) => setExplaination(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {template.id ? "Saving..." : "Creating..."}
              </>
            ) : (
              template.id ? "Save" : "Create New"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}