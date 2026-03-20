import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check your .env.local file.')
}

if (supabaseAnonKey?.startsWith('sb_secret')) {
  console.error('CRITICAL: You are using a Secret Key in NEXT_PUBLIC_SUPABASE_ANON_KEY. This will not work for client-side auth and is a security risk. Use the "anon" "public" key starting with "eyJ" instead.')
}

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)
