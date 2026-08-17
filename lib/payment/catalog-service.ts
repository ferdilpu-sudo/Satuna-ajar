import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { PublicPlan } from '@/types/payment';

export async function listPublicPlans(): Promise<PublicPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('code,name,billing_type,price_amount,currency,generation_quota,interval_unit')
    .eq('is_active', true);

  if (error) throw new Error(`PUBLIC_PLANS_FAILED: ${error.message}`);

  return (data ?? [])
    .map((row) => ({
      code: row.code,
      name: row.name,
      billingType: row.billing_type as PublicPlan['billingType'],
      priceAmount: Number(row.price_amount),
      currency: row.currency,
      generationQuota: row.generation_quota === null ? null : Number(row.generation_quota),
      intervalUnit: row.interval_unit as PublicPlan['intervalUnit'],
    }))
    .sort(comparePlans);
}

function comparePlans(a: PublicPlan, b: PublicPlan): number {
  if (a.billingType !== b.billingType) return a.billingType === 'one_time' ? -1 : 1;
  if (a.billingType === 'one_time') return (a.generationQuota ?? 0) - (b.generationQuota ?? 0);
  return a.priceAmount - b.priceAmount;
}
