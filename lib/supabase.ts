import { createClient } from '@supabase/supabase-js';
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
  : createClient(supabaseUrl, supabaseAnonKey);

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
    platforms: ['TIKTOK', 'YOUTUBE', 'INSTAGRAM'],
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
      platforms: ['TIKTOK', 'YOUTUBE', 'INSTAGRAM'],
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

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (isDemoModeActive()) {
    const current = await getUserProfile();
    const updated = {
      ...(current || {
        id: user.id,
        created_at: new Date().toISOString(),
        onboarded: true
      }),
      ...profile,
      updated_at: new Date().toISOString()
    } as UserProfile;
    
    safeLocalStorageSet('viralspy_guest_profile', JSON.stringify(updated));
    return updated;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving profile:', error);
    return null;
  }

  return data;
}
