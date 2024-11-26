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
import { Loader2 } from "lucide-react";

interface SaveTemplateButtonProps {
  template: {
    id: number;
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
      console.log(code)
      const response = await fetchWithAuthRetry(`/api/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          explaination,
          tags,
          content: code
        }),
      });

      if (response.ok) {
        toast.success("Template saved successfully.");
        setOpen(false);
        router.reload(); // Refresh the page to show updated data
      } else {
        const data = await response.json();
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
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          Save...
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
          <DialogDescription>
            Update the template details and save your changes.
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
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}