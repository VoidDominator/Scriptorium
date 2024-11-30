"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure hydration consistency
  }, []);

  if (!mounted) return null; // Prevent mismatch between SSR and client

  return (
    <div className="flex space-x-2">
      {/* Light Theme Button */}
      <Button
        variant="default"
        onClick={() => setTheme("light")}
        className={theme === "light" ? "border-2 border-blue-500" : ""}
      >
        Light Theme
      </Button>

      {/* Dark Theme Button */}
      <Button
        variant="default"
        onClick={() => setTheme("dark")}
        className={theme === "dark" ? "border-2 border-blue-500" : ""}
      >
        Dark Theme
      </Button>

      {/* Custom Theme Example */}
      <Button
        variant="default"
        onClick={() => setTheme("system")}
        className={theme === "system" ? "border-2 border-blue-500" : ""}
      >
        System Default
      </Button>
    </div>
  );
};
