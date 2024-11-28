import * as React from "react"
import Link from "next/link"
import {
  Book,
  SquareTerminal,
  Bot,
  BookOpen,
  PieChart,
  Map,
  Contact,
  Settings
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"

import { ModeToggle } from "./theme-switcher"

interface User {
  // unused interface
  name: string
  email: string
  avatar: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null // User info or null if not logged in

}

const defaultUser = {
  name: "Guest",
  email: "guest@example.com",
  avatar: "/avatars/default-avatar.jpg",
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const displayUser = user || defaultUser
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-primary cursor-pointer" />
          <span className="font-semibold text-lg text-primary">Scriptorium</span>
        </Link>
        {/* <SidebarTrigger /> */}
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Code",
              url: "#",
              icon: SquareTerminal,
              isActive: true,
              items: [
                { title: "Getting Started", url: "/editor" },
                { title: "Supported Languages", url: "/" },
              ],
            },
            {
              title: "Blogs",
              url: "/blog",
              icon: Bot,
              items: [
                { title: "View", url: "/blog/blog-post" },
                { title: "New Ideas?", url: "/blog/create" },
                { title: "History", url: "/blog/history" },
                { title: "Starred", url: "/blog/starred" },
              ],
            },
            {
              title: "Template",
              url: "#",
              icon: BookOpen,
              items: [
                { title: "All Templates", url: "/templates" },
                { title: "My Templates", url: "/templates/my" },
                // { title: "Settings", url: "#" },
              ],
            },
          ]}
        />
        <NavProjects
          projects={[
            { name: "Profile", url: "/users/profile", icon: Contact },
            { name: "Settings", url: "/users/settings", icon: Settings },
          ]}
        />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <ModeToggle isSidebarCollapsed={true} />
        <NavUser />
      </SidebarFooter>

      {/* Sidebar Rail */}
      <SidebarRail />
    </Sidebar>
  )
}
