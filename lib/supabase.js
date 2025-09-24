import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bpkllpunhmaooanfyaqx.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwa2xscHVuaG1hb29hbmZ5YXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjU5MTksImV4cCI6MjA3NDEwMTkxOX0.SFg5NGeevmrpxOjj8vf3SMqPM6YJG3L-jJjCkh4UjHo";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

