import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL = "https://akvxlsvkpdmlmjfcrjjw.supabase.co";
export const DEFAULT_SUPABASE_KEY = "sb_publishable__XscXO9G0Bd0oFUVomYcig_1vBD5BXX";

export const SUPABASE_KEYS = {
  URL: 'nupra_supabase_url',
  KEY: 'nupra_supabase_key',
};

const activeUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const activeKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  try {
    const savedUrl = await AsyncStorage.getItem(SUPABASE_KEYS.URL);
    const savedKey = await AsyncStorage.getItem(SUPABASE_KEYS.KEY);

    if (savedUrl && savedKey) {
      return createClient(savedUrl, savedKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    }
  } catch (e) {
    console.log('Error initializing dynamic Supabase client:', e);
  }

  return supabase;
};

export const initSupabaseClient = async (url: string, key: string): Promise<SupabaseClient> => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  await AsyncStorage.setItem(SUPABASE_KEYS.URL, cleanUrl);
  await AsyncStorage.setItem(SUPABASE_KEYS.KEY, cleanKey);

  return createClient(cleanUrl, cleanKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};
