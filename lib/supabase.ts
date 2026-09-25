import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_KEYS = {
  URL: 'nupra_supabase_url',
  KEY: 'nupra_supabase_key',
};

let supabaseInstance: SupabaseClient | null = null;

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (envUrl && envKey && !envUrl.includes('your_supabase')) {
  supabaseInstance = createClient(envUrl, envKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (supabaseInstance) return supabaseInstance;

  try {
    const savedUrl = await AsyncStorage.getItem(SUPABASE_KEYS.URL);
    const savedKey = await AsyncStorage.getItem(SUPABASE_KEYS.KEY);

    if (savedUrl && savedKey) {
      supabaseInstance = createClient(savedUrl, savedKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      return supabaseInstance;
    }
  } catch (e) {
    console.log('Error initializing dynamic Supabase client:', e);
  }

  return supabaseInstance;
};

export const initSupabaseClient = async (url: string, key: string): Promise<SupabaseClient> => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  await AsyncStorage.setItem(SUPABASE_KEYS.URL, cleanUrl);
  await AsyncStorage.setItem(SUPABASE_KEYS.KEY, cleanKey);

  supabaseInstance = createClient(cleanUrl, cleanKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseInstance;
};

export const supabase = supabaseInstance;
