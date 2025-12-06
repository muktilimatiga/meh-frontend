import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Using environment variables if available, otherwise falling back to placeholders
// which will be handled gracefully by the hooks (e.g., showing mock data or empty states)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);