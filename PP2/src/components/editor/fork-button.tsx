import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface ForkTemplateButtonProps {
  templateId?: number;
}

export function ForkTemplateButton({ templateId }: ForkTemplateButtonProps) {
  const [isForking, setIsForking] = useState(false);
  const router = useRouter();

  const handleFork = async () => {
    if (!templateId) return;

    setIsForking(true);
    try {
      const response = await fetchWithAuthRetry(`/api/templates/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Template forked successfully. You are now viewing the forked template."
        );
        router.push(`/editor/${data.templateId}`);
      } else {
        toast.error(data.error || "Failed to fork the template.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while forking the template.");
    } finally {
      setIsForking(false);
    }
  };

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div>
          <Button
            onClick={handleFork}
            disabled={!templateId || isForking}
            className="w-full"
          >
            {isForking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Forking...
              </>
            ) : (
              "Fork"
            )}
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="left" align="center" className="text-sm">
        {templateId ? (
          <span>This will create a copy of the template in your account.</span>
        ) : (
          <span>There is no template to fork.</span>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}