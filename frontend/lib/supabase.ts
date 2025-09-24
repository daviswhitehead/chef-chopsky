import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import https from 'https'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Create axios instance with SSL verification disabled for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Create client with publishable key
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  global: {
    fetch: (url, options) => {
      return axiosInstance.request({
        url: url.toString(),
        method: options?.method || 'GET',
        headers: options?.headers as any,
        data: options?.body
      }).then(response => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers as any),
        json: () => Promise.resolve(response.data),
        text: () => Promise.resolve(JSON.stringify(response.data))
      }))
    }
  }
})

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
      return axiosInstance.request({
        url: url.toString(),
        method: options?.method || 'GET',
        headers: options?.headers as any,
        data: options?.body
      }).then(response => ({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers as any),
        json: () => Promise.resolve(response.data),
        text: () => Promise.resolve(JSON.stringify(response.data))
      }))
    }
  }
})
