"use client";
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardNavigation } from '@/components/dashboard-navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <DashboardNavigation />
                <main>
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
