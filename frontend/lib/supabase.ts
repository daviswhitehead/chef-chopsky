import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Create client with publishable key
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// For server-side operations, try to use service role key if available
// Otherwise fall back to publishable key (should work with RLS policies)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabasePublishableKey

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options) => {
      console.log('Supabase fetch request:', url, options?.method);
      return fetch(url, options);
    }
  }
})
