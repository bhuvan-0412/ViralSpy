import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { UserProfile, NicheType } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR-safe LocalStorage helpers
const safeLocalStorageGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

const safeLocalStorageRemove = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

export const isDemoModeActive = (): boolean => {
  if (typeof window === 'undefined') return true;
  const isPlaceholder =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-supabase-project') ||
    supabaseAnonKey.includes('placeholder') ||
    supabaseAnonKey.includes('your-supabase-anon-key');

  const guestUser = safeLocalStorageGet('viralspy_guest_user');
  return isPlaceholder || !!guestUser;
};

// Create client instance safely
export const supabase = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')
  ? null
  : createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  if (isDemoModeActive()) {
    const guest = safeLocalStorageGet('viralspy_guest_user');
    if (guest) {
      return JSON.parse(guest);
    }
    return null;
  }

  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithGoogle() {
  if (isDemoModeActive() || !supabase) {
    return signInAsGuest();
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
}

export async function signInAsGuest() {
  if (typeof window === 'undefined') return null;

  const guestUser = {
    id: 'demo-guest-uuid-1234-5678',
    email: 'creator.demo@viralspy.io',
    user_metadata: {
      full_name: 'Demo Creator',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  };
  safeLocalStorageSet('viralspy_guest_user', JSON.stringify(guestUser));
  
  // Initialize profile in local storage
  const profile: UserProfile = {
    id: guestUser.id,
    display_name: 'Demo Creator',
    avatar_url: guestUser.user_metadata.avatar_url,
    niches: ['fitness', 'food', 'tech'],
    platforms: ['YOUTUBE', 'INSTAGRAM', 'REDDIT', 'X'],
    subscriber_count: 12500,
    onboarded: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  safeLocalStorageSet('viralspy_guest_profile', JSON.stringify(profile));

  return guestUser;
}

export async function signOutUser() {
  if (typeof window === 'undefined') return;

  safeLocalStorageRemove('viralspy_guest_user');
  safeLocalStorageRemove('viralspy_guest_profile');
  safeLocalStorageRemove('viralspy_demo_trends');
  
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (isDemoModeActive()) {
    const saved = safeLocalStorageGet('viralspy_guest_profile');
    if (saved) return JSON.parse(saved);
    
    // Default guest profile
    const defaultProfile: UserProfile = {
      id: user.id,
      display_name: 'Demo Creator',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      niches: ['fitness', 'food', 'tech'],
      platforms: ['YOUTUBE', 'INSTAGRAM', 'REDDIT', 'X'],
      subscriber_count: 12500,
      onboarded: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    safeLocalStorageSet('viralspy_guest_profile', JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function saveUserProfile(updates: object) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null // Not logged in, skip silently
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single()
    
    if (error) {
      if (error.code === '42501') return null // RLS, skip
      console.error('Error saving profile:', error)
      return null
    }
    return data
  } catch (e) {
    return null // Never crash the app for profile saves
  }
}
