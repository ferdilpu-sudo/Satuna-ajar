import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { OneTimePurchaseRow, PaymentRow, SubscriptionRow } from '@/types/admin';

export interface AdminCommerceData {
  activeSubscriptions: number;
  oneTimeTransactions30d: number;
  oneTimeBuyers30d: number;
  unusedGenerationRights: number;
  monthRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  subscriptions: SubscriptionRow[];
  oneTimePurchases: OneTimePurchaseRow[];
  payments: PaymentRow[];
}

export async function getAdminCommerce(): Promise<AdminCommerceData> {
  const supabase = createAdminClient();
  const since30d = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [{ data: subscriptions, error: subError }, { data: payments, error: payError }, { data: rights, error: rightsError }, usersResult] = await Promise.all([
    supabase.from('subscriptions').select('id,user_id,status,current_period_end,plans(name,price_amount)').order('created_at', { ascending: false }).limit(100),
    supabase.from('payments').select('id,user_id,provider,kind,amount,status,paid_at,created_at,plans(name)').order('created_at', { ascending: false }).limit(100),
    supabase.from('generation_entitlements').select('user_id,total_uses,used_uses,status,source_payment_id').eq('source', 'one_time'),
    supabase.auth.admin.listUsers({ page: 1, perPage: 100 }),
  ]);

  if (subError || payError || rightsError || usersResult.error) throw new Error(`ADMIN_COMMERCE_FAILED: ${subError?.message ?? payError?.message ?? rightsError?.message ?? usersResult.error?.message}`);

  const names = new Map(usersResult.data.users.map((user) => [user.id, String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'Pengguna Satuna')]));
  const customer = (userId: string) => names.get(userId) ?? 'Pengguna Satuna';
  const plan = (value: unknown) => Array.isArray(value) ? value[0] : value as { name?: string; price_amount?: number } | null;

  const mappedSubscriptions: SubscriptionRow[] = (subscriptions ?? []).map((row) => {
    const currentPlan = plan(row.plans);
    return { id: row.id, customer: customer(row.user_id), plan: currentPlan?.name ?? 'Pro', amount: Number(currentPlan?.price_amount ?? 0), status: subscriptionStatus(row.status), renewAt: row.current_period_end ? formatDate(row.current_period_end) : '-' };
  });

  const rightByPayment = new Map((rights ?? []).filter((row) => row.source_payment_id).map((row) => [row.source_payment_id, row]));
  const oneTimePurchases: OneTimePurchaseRow[] = (payments ?? []).filter((row) => row.kind === 'one_time').map((row) => {
    const currentPlan = plan(row.plans); const right = rightByPayment.get(row.id);
    return { id: row.id, customer: customer(row.user_id), product: currentPlan?.name ?? '1x Generasi AI', amount: Number(row.amount), status: paymentStatus(row.status), usage: right && Number(right.used_uses) >= Number(right.total_uses) ? 'Sudah digunakan' : 'Belum digunakan', purchasedAt: formatDate(row.paid_at ?? row.created_at) };
  });

  const mappedPayments: PaymentRow[] = (payments ?? []).map((row) => ({ id: row.id, customer: customer(row.user_id), amount: Number(row.amount), status: paymentStatus(row.status), paidAt: formatDate(row.paid_at ?? row.created_at), provider: row.provider, kind: row.kind === 'one_time' ? 'Beli sekali' : 'Langganan', item: plan(row.plans)?.name ?? (row.kind === 'one_time' ? '1x Generasi AI' : 'Langganan') }));

  const paid = (payments ?? []).filter((row) => row.status === 'paid' && row.paid_at && Date.parse(row.paid_at) >= monthStart.getTime());
  const oneTime30d = (payments ?? []).filter((row) => row.kind === 'one_time' && row.status === 'paid' && row.paid_at && row.paid_at >= since30d);

  return {
    activeSubscriptions: (subscriptions ?? []).filter((row) => row.status === 'active').length,
    oneTimeTransactions30d: oneTime30d.length,
    oneTimeBuyers30d: new Set(oneTime30d.map((row) => row.user_id)).size,
    unusedGenerationRights: (rights ?? []).reduce((sum, row) => sum + Math.max(0, Number(row.total_uses) - Number(row.used_uses)), 0),
    monthRevenue: paid.reduce((sum, row) => sum + Number(row.amount), 0),
    recurringRevenue: paid.filter((row) => row.kind === 'subscription').reduce((sum, row) => sum + Number(row.amount), 0),
    oneTimeRevenue: paid.filter((row) => row.kind === 'one_time').reduce((sum, row) => sum + Number(row.amount), 0),
    subscriptions: mappedSubscriptions,
    oneTimePurchases,
    payments: mappedPayments,
  };
}

function paymentStatus(value: string): PaymentRow['status'] { return value === 'paid' ? 'Berhasil' : value === 'refunded' ? 'Refund' : 'Gagal'; }
function subscriptionStatus(value: string): SubscriptionRow['status'] { return value === 'active' ? 'Aktif' : value === 'cancelled' || value === 'expired' ? 'Dibatalkan' : 'Jatuh tempo'; }
function formatDate(value: string): string { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)); }
