import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wmcatarzsdnyuyrgrcak.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtY2F0YXJ6c2RueXV5cmdyY2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjkwMjcsImV4cCI6MjA2ODY0NTAyN30.zbKN8xKd6SZK6jAAP0tQZbDyxb6gPRy7zW1QH7vR_q8";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

