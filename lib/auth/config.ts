export type AuthMode = 'disabled' | 'optional' | 'enforce';

const MODES = new Set<AuthMode>(['disabled', 'optional', 'enforce']);

export function getAuthMode(): AuthMode {
  const raw = (process.env.SATUNA_AUTH_MODE || 'optional').trim().toLowerCase() as AuthMode;
  return MODES.has(raw) ? raw : 'optional';
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}

export function authIsEnforced(): boolean {
  return getAuthMode() === 'enforce' && hasSupabaseEnv();
}
