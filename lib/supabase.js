import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR-safe LocalStorage helpers
const safeLocalStorageGet = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeLocalStorageSet = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

const safeLocalStorageRemove = (key) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

export const isDemoModeActive = () => {
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

let supabaseInstance = null;
try {
  const isPlaceholder = 
    !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl.includes('placeholder') || 
    supabaseUrl.includes('your-supabase-project');
    
  if (!isPlaceholder) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.warn('Failed to initialize Supabase client:', e.message);
}

export const supabase = supabaseInstance;

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
      redirectTo: `${window.location.origin}/dashboard`
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
  return guestUser;
}

export async function signOutUser() {
  if (typeof window === 'undefined') return;

  safeLocalStorageRemove('viralspy_guest_user');
  safeLocalStorageRemove('viralspy_demo_niches');
  
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getUserNiches() {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoModeActive()) {
    const savedNiches = safeLocalStorageGet('viralspy_demo_niches');
    return savedNiches ? JSON.parse(savedNiches) : [];
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_niches')
    .select('niche')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user niches:', error);
    const savedNiches = safeLocalStorageGet('viralspy_demo_niches');
    return savedNiches ? JSON.parse(savedNiches) : [];
  }

  return data.map(n => n.niche);
}

export async function saveUserNiches(niches) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No active user session');

  safeLocalStorageSet('viralspy_demo_niches', JSON.stringify(niches));

  if (isDemoModeActive() || !supabase) {
    return niches;
  }

  await supabase
    .from('user_niches')
    .delete()
    .eq('user_id', user.id);

  const records = niches.map(niche => ({
    user_id: user.id,
    niche: niche
  }));

  const { error } = await supabase
    .from('user_niches')
    .insert(records);

  if (error) {
    console.error('Error saving user niches:', error);
  }

  return niches;
}
