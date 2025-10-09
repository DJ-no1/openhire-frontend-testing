/**
 * Get the site URL for redirects and email verification
 * This handles both client-side and server-side environments
 */
export const getSiteURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000';

    // Make sure to include `https://` when not localhost.
    url = url.startsWith('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.endsWith('/') ? url : `${url}/`;
    return url;
};

/**
 * Get the auth callback URL
 */
export const getAuthCallbackURL = () => {
    return `${getSiteURL()}auth/callback`;
};
