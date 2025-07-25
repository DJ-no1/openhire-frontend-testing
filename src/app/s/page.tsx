"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "@/components/CustomSidebar";

export default function SidebarDemoPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CustomSidebar />
        <main className="flex-1 p-8 bg-background">
          <h1 className="text-3xl font-bold mb-6">Sidebar Demo</h1>
          <p className="text-lg">
            This is a demo page using the custom sidebar component. You can add
            your main content here.
          </p>
        </main>
      </div>
    </SidebarProvider>
  );
}
