import { createClient } from "@supabase/supabase-js";

// Make sure to use import.meta.env for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);
