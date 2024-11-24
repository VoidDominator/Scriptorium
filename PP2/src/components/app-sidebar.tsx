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
} from "@/components/ui/sidebar"

interface User {
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

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-primary cursor-pointer" />
          <span className="font-semibold text-lg text-primary">Scriptorium</span>
        </Link>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Code Compiler",
              url: "#",
              icon: SquareTerminal,
              isActive: true,
              items: [
                { title: "Getting Started", url: "/editor" },
                { title: "Tutorial", url: "#" },
                // { title: "Settings", url: "#" },
              ],
            },
            {
              title: "Blogs",
              url: "/blog",
              icon: Bot,
              items: [
                { title: "View", url: "/blog/blog-post" },
                { title: "New Ideas?", url: "/blog/create" },
                { title: "History", url: "#" },
                { title: "Starred", url: "#" },
                // { title: "Settings", url: "#" },
              ],
            },
            {
              title: "Template",
              url: "#",
              icon: BookOpen,
              items: [
                { title: "History", url: "#" },
                { title: "Starred", url: "#" },
                // { title: "Settings", url: "#" },
              ],
            },
          ]}
        />
        <NavProjects
          projects={[
            { name: "Profile", url: "#", icon: Contact },
            { name: "Settings", url: "/users/settings", icon: Settings },
          ]}
        />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <div className="text-center text-sm">Not logged in</div>
        )}
      </SidebarFooter>

      {/* Sidebar Rail */}
      <SidebarRail />
    </Sidebar>
  )
}
