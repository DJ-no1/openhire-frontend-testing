"use client"
import CustomSidebar from "../../components/CustomSidebar";

export default function SidebarDemoPage() {
  return (
    <div className="flex h-screen">
      <CustomSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Sidebar Demo</h1>
        <p>This is a demo page using the custom sidebar component.</p>
      </div>
    </div>
  );
}
