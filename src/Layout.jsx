import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Journal Finder",
    url: createPageUrl("JournalFinder"),
    icon: Search,
  },
  {
    title: "Browse Journals",
    url: createPageUrl("BrowseJournals"),
    icon: BookOpen,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: #1a365d;
            --primary-foreground: #ffffff;
            --secondary: #e2e8f0;
            --accent: #10b981;
            --accent-foreground: #ffffff;
            --background: #fafafa;
            --foreground: #1a202c;
            --card: #ffffff;
            --border: #e2e8f0;
            --muted: #f7fafc;
            --muted-foreground: #718096;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, #1a365d 0%, #2d4a6b 100%);
          }
          
          .journal-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(0);
          }
          
          .journal-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border hidden lg:flex">
          <SidebarHeader className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-foreground">Frontiers</h2>
                <p className="text-sm text-muted-foreground">Journal Finder</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-accent text-accent-foreground shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-foreground">Frontiers Journal Finder</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}