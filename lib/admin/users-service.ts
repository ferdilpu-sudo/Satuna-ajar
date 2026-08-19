import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminUserRow } from '@/types/admin';

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createAdminClient();
  const [{ data: usersData, error: usersError }, { data: admins, error: adminsError }, { data: subscriptions }, { data: entitlements }, { data: usage }] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 100 }),
    supabase.from('admin_members').select('user_id').eq('is_active', true),
    supabase.from('subscriptions').select('user_id,status').eq('status', 'active'),
    supabase.from('generation_entitlements').select('user_id,total_uses,used_uses').eq('source', 'one_time'),
    supabase.from('generation_usage').select('user_id,status').eq('status', 'completed'),
  ]);

  if (usersError) throw new Error(`ADMIN_USERS_FAILED: ${usersError.message}`);
  if (adminsError) throw new Error(`ADMIN_USERS_FAILED: ${adminsError.message}`);

  const adminIds = new Set((admins ?? []).map((row) => row.user_id));
  const proIds = new Set((subscriptions ?? []).map((row) => row.user_id));
  const paidUses = new Map<string, number>();
  const documents = new Map<string, number>();

  for (const row of entitlements ?? []) {
    paidUses.set(row.user_id, (paidUses.get(row.user_id) ?? 0) + Number(row.total_uses ?? 0));
  }
  for (const row of usage ?? []) {
    documents.set(row.user_id, (documents.get(row.user_id) ?? 0) + 1);
  }

  return usersData.users
    .filter((user) => !adminIds.has(user.id))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((user) => ({
      id: user.id,
      name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Pengguna Satuna'),
      email: user.email ?? '-',
      plan: proIds.has(user.id) ? 'Pro' : 'Gratis',
      status: user.last_sign_in_at ? 'Aktif' : 'Trial habis',
      documents: documents.get(user.id) ?? 0,
      paidGenerations: paidUses.get(user.id) ?? 0,
      joinedAt: formatDate(user.created_at),
      lastActive: user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Belum pernah',
    }));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}
