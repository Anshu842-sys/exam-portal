import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'exam_cell_supabase_url';
const STORAGE_KEY_KEY = 'exam_cell_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isValid = 
    Boolean(url) && 
    url.startsWith('https://') && 
    !url.includes('your-project') &&
    Boolean(key) && 
    !key.includes('your-anon-key');

  return { url, key, isValid };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  // Reload or re-instantiate
  supabaseInstance = initSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;

function initSupabaseClient(): SupabaseClient | null {
  const { url, key, isValid } = getStoredSupabaseConfig();
  if (!isValid) return null;

  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    supabaseInstance = initSupabaseClient();
  }
  return supabaseInstance;
}
