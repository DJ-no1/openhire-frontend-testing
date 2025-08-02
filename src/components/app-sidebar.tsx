"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Brain,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "OpenHire User",
    email: "user@openhire.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "AI Analysis",
      url: "/resume-review",
      icon: Brain,
      items: [
        {
          title: "Resume Review",
          url: "/resume-review",
        },
        {
          title: "Bulk Analysis",
          url: "/resume-review/bulk",
        },
        {
          title: "Analysis History",
          url: "/resume-review/history",
        },
      ],
    },
    {
      title: "Job Search",
      url: "/dashboard/jobs",
      icon: FileText,
      items: [
        {
          title: "Browse Jobs",
          url: "/dashboard/jobs",
        },
        {
          title: "Public Jobs",
          url: "/jobs",
        },
        {
          title: "Saved Jobs",
          url: "/dashboard/jobs/saved",
        },
      ],
    },
    {
      title: "Candidates",
      url: "/candidates",
      icon: Users,
      items: [
        {
          title: "All Candidates",
          url: "/candidates",
        },
        {
          title: "Shortlisted",
          url: "/candidates/shortlisted",
        },
        {
          title: "Pipeline",
          url: "/candidates/pipeline",
        },
      ],
    },
    {
      title: "Communications",
      url: "/chat",
      icon: MessageSquare,
      items: [
        {
          title: "Chat",
          url: "/chat",
        },
        {
          title: "Email Templates",
          url: "/chat/templates",
        },
        {
          title: "Notifications",
          url: "/chat/notifications",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
        {
          title: "API Keys",
          url: "/settings/api",
        },
        {
          title: "Team",
          url: "/settings/team",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Frontend Engineering",
      url: "/projects/frontend",
      icon: Frame,
    },
    {
      name: "Backend Development",
      url: "/projects/backend",
      icon: BarChart3,
    },
    {
      name: "Data Science",
      url: "/projects/data",
      icon: PieChart,
    },
    {
      name: "Product Management",
      url: "/projects/product",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">OpenHire</span>
                  <span className="truncate text-xs">AI Recruitment</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
