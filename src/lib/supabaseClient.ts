import { createClient } from './supabase/client'

// Create the client using the new cookie-based approach
export const supabase = createClient()