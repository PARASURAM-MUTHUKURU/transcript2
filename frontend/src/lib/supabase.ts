import { createClient, SupabaseClient } from '@supabase/supabase-js';

export let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};
