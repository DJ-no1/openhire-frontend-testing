"use client"
import * as React from "react";
import { Command } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

// Example sidebar data based on your screenshot
const sidebarData = [
  { label: "Dashboard", icon: Command, href: "/dashboard" },
  { label: "Job Listing", icon: Command, href: "/job-listing" },
  { label: "Job Applications", icon: Command, href: "/job-applications" },
];

export default function CustomSidebar() {
  return (
    <Sidebar variant="inset" className="h-screen w-64 bg-white border-r flex flex-col justify-between">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">Hirelytics</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-4">
        <SidebarMenu>
          {sidebarData.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild size="lg">
                <a href={item.href} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-base">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">AR</span>
          <span className="text-xs text-gray-500">Anand Ram</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
