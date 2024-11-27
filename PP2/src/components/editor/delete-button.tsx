import { useState } from "react";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import { Loader2 } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useUser } from '@/context/user-context';

interface DeleteTemplateButtonProps {
  templateId?: number;
  authorId?: number;
}

export function DeleteTemplateButton({ templateId, authorId }: DeleteTemplateButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleDelete = async () => {
    if (!templateId) return;

    setIsDeleting(true);
    try {
      const response = await fetchWithAuthRetry(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Template deleted successfully.");
        router.push("/templates");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete the template.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the template.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={!templateId || isDeleting || user?.id !== authorId}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogTrigger>
            {templateId && (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this template? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="left" align="center" className="text-sm">
        {user?.id !== authorId ? (
          <span>This is not yours. Create a fork if you want to modify.</span>
        ) :
          templateId ? (
            <span>This will permanently delete the template.</span>
          ) : (
            <span>There is no template to delete.</span>
          )}
      </HoverCardContent>
    </HoverCard>
  );
}