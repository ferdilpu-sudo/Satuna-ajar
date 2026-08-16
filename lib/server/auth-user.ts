import { getAuthMode, hasSupabaseEnv } from '@/lib/auth/config';
import { createClient } from '@/lib/supabase/server';

export async function getAuthenticatedUserId(): Promise<string | null> {
  if (!hasSupabaseEnv() || getAuthMode() === 'disabled') return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error) return null;
    const subject = data?.claims?.sub;
    return typeof subject === 'string' && subject ? subject : null;
  } catch {
    return null;
  }
}
