import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://chlccnbyntjrbxptrmgf.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGNjbmJ5bnRqcmJ4cHRybWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDI1NDgsImV4cCI6MjA5MzU3ODU0OH0.tv1I_5nXeQEywmwiuuBncE1xh4xo0P27wbcaWTJUAzY'
)
