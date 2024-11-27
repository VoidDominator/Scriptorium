import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/user-context";

// Example: Static or dynamic user info
const mockUser = {
  name: "Guest", // Replace with dynamic user data after login
  email: "visitor@example.com",
  avatar: "/avatars/john-doe.jpg",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <SidebarProvider>
          <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <AppSidebar className="h-full" user={mockUser} />

            {/* Main content */}
            <main className="flex-1 h-full">
              <div className="flex h-full">
                <Component {...pageProps} />
              </div>
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  );
}
