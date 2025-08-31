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

        // Verify user role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || userData?.role !== 'recruiter') {
            return NextResponse.json(
                { error: 'Forbidden - Recruiter access required' },
                { status: 403 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '4');

        // Get recent activity
        const activity = await RecruiterDashboardService.getRecentActivity(user.id, limit);

        return NextResponse.json({
            success: true,
            data: activity
        });

    } catch (error) {
        console.error('Error fetching recruiter activity:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch recent activity',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
