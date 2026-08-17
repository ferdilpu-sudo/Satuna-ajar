import { createClient } from '@/lib/supabase/server';

function bootstrapAdminEmails(): Set<string> {
  const raw = process.env.SATUNA_ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getAdminAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    return { status: 'unauthenticated' as const, user: null };
  }

  const email = user.email?.toLowerCase();
  if (email && bootstrapAdminEmails().has(email)) {
    return { status: 'allowed' as const, user };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('admin_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (membershipError || !membership) {
    return { status: 'forbidden' as const, user };
  }

  return { status: 'allowed' as const, user, role: membership.role };
}
