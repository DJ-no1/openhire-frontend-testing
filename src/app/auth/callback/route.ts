import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Create user profile if it doesn't exist
            const { data: existingProfile } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (!existingProfile) {
                // Get metadata from auth user
                const userName = data.user.user_metadata?.name ||
                    data.user.user_metadata?.display_name ||
                    data.user.email?.split('@')[0] ||
                    'User'
                const userRole = data.user.user_metadata?.role || 'candidate'

                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email!,
                        name: userName,
                        role: userRole,
                    })

                if (profileError) {
                    console.error('Failed to create user profile after verification:', profileError)
                } else {
                    console.log('✅ User profile created after email verification:', {
                        id: data.user.id,
                        email: data.user.email,
                        name: userName,
                        role: userRole,
                    })
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
