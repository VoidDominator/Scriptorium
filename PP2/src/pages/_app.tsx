import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex h-screen w-screen">
          {/* Sidebar */}
          <AppSidebar className="h-full" />

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
