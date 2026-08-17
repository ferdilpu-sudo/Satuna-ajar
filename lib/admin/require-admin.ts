import { notFound, redirect } from 'next/navigation';
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

export async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect('/login?next=/admin');
  }

  const email = user.email?.toLowerCase();
  if (email && bootstrapAdminEmails().has(email)) {
    return user;
  }

  const { data: membership, error: membershipError } = await supabase
    .from('admin_members')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (membershipError || !membership) {
    notFound();
  }

  return user;
}
