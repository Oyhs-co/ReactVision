export interface UserProfile {
  age: number;
  gender: string;
  wearsGlasses: boolean;
  visualFatigue: number;
  savedAt?: string;
}

const KEY = 'reactivision-user';

export function saveUserProfile(profile: UserProfile) {
  const p = { ...profile, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
  return p;
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
