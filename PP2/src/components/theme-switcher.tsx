import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModeToggleProps {
  isSidebarCollapsed: boolean;
}

export function ModeToggle({ isSidebarCollapsed }: ModeToggleProps) {
  const { setTheme, theme } = useTheme();

  if (isSidebarCollapsed) {
    // Collapsed sidebar: display as a button with dropdown menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    // Expanded sidebar: display as tabs with no content attached
    return (
      <Tabs
        value={theme === "system" ? "system" : theme || "light"}
        onValueChange={(value) => setTheme(value)}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="light" className="w-full">
            Light
          </TabsTrigger>
          <TabsTrigger value="dark" className="w-full">
            Dark
          </TabsTrigger>
          <TabsTrigger value="system" className="w-full">
            System
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }
}