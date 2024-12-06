import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nsjxcdkmrhuupxknqotw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanhjZGttcmh1dXB4a25xb3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0ODU1NzksImV4cCI6MjA0OTA2MTU3OX0.OoTUuQ2ZVpDd1_mHkHMlfTptpat4fYkGX0dHZ9w-Uv4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
