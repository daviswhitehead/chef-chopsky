import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for CI/build environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder_key'

// Create client with publishable key
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// For server-side operations, use secret key if available
// Otherwise fall back to publishable key (should work with RLS policies)
const secretKey = process.env.SUPABASE_SECRET_KEY || supabasePublishableKey

export const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
