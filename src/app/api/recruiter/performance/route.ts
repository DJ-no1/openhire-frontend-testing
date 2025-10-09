import { NextRequest, NextResponse } from 'next/server';
import { RecruiterDashboardService } from '@/lib/dashboard-data';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Create Supabase client with cookies
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        // This is a read-only operation, so we don't need to set cookies
                    },
                },
            }
        );

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user role - check both users table and auth metadata
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        // Fallback to auth metadata if users table doesn't have role
        const userRole = userData?.role || user.user_metadata?.role || 'candidate';

        if (userRole !== 'recruiter') {
            return NextResponse.json(
                { error: 'Forbidden - Recruiter access required' },
                { status: 403 }
            );
        }

        // Get performance metrics
        const metrics = await RecruiterDashboardService.getPerformanceMetrics(user.id);

        return NextResponse.json({
            success: true,
            data: metrics
        });

    } catch (error) {
        console.error('Error fetching recruiter performance metrics:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch performance metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
