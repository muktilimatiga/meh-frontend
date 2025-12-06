import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Using environment variables if available, otherwise falling back to placeholders
// which will be handled gracefully by the hooks (e.g., showing mock data or empty states)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrtpzwkdnockcfpvczar.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydHB6d2tkbm9ja2NmcHZjemFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI3MDksImV4cCI6MjA3OTgwODcwOX0.lW-V0OSe5G8PgAt0i-AA8vC_jsAoLPUeYW_MGmkO0Rw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);