import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { PaymentProviderName, ProviderCheckoutResult, PublicPlan, VerifiedPaymentEvent } from '@/types/payment';

export interface PreparedCheckout {
  orderId: string;
  user: { id: string; email: string | null; name: string | null };
  plan: PublicPlan;
}

export async function prepareCheckout(planCode: string, idempotencyKey: string): Promise<PreparedCheckout> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData.user;
  if (authError || !user) throw new Error('AUTH_REQUIRED');

  const { data: orderId, error: orderError } = await supabase.rpc('create_checkout_order', {
    p_plan_code: planCode,
    p_idempotency_key: idempotencyKey,
  });
  if (orderError || !orderId) throw new Error(`CHECKOUT_ORDER_FAILED: ${orderError?.message ?? 'order id missing'}`);

  const { data: order, error: checkoutError } = await supabase
    .from('checkout_orders')
    .select('id,plan_id')
    .eq('id', orderId)
    .single();
  if (checkoutError || !order) throw new Error(`CHECKOUT_ORDER_READ_FAILED: ${checkoutError?.message ?? 'order missing'}`);

  const { data: planRow, error: planError } = await supabase
    .from('plans')
    .select('code,name,billing_type,price_amount,currency,generation_quota,interval_unit')
    .eq('id', order.plan_id)
    .single();
  if (planError || !planRow) throw new Error(`CHECKOUT_PLAN_READ_FAILED: ${planError?.message ?? 'plan missing'}`);

  return {
    orderId: order.id,
    user: {
      id: user.id,
      email: user.email ?? null,
      name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '') || null,
    },
    plan: {
      code: planRow.code,
      name: planRow.name,
      billingType: planRow.billing_type as PublicPlan['billingType'],
      priceAmount: Number(planRow.price_amount),
      currency: planRow.currency,
      generationQuota: planRow.generation_quota === null ? null : Number(planRow.generation_quota),
      intervalUnit: planRow.interval_unit as PublicPlan['intervalUnit'],
    },
  };
}

export async function attachProviderCheckout(
  orderId: string,
  provider: PaymentProviderName,
  checkout: ProviderCheckoutResult,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('assign_checkout_provider', {
    p_order_id: orderId,
    p_provider: provider,
    p_provider_reference: checkout.providerReference,
    p_checkout_url: checkout.checkoutUrl,
    p_expires_at: checkout.expiresAt,
  });
  if (error) throw new Error(`CHECKOUT_PROVIDER_ASSIGN_FAILED: ${error.message}`);
}

export async function finalizeVerifiedPayment(event: VerifiedPaymentEvent): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('finalize_checkout_payment', {
    p_order_id: event.orderId,
    p_provider: event.provider,
    p_provider_event_id: event.eventId,
    p_event_type: event.eventType,
    p_provider_payment_id: event.providerPaymentId,
    p_payment_status: event.status,
    p_amount: event.amount,
    p_currency: event.currency,
    p_payload: event.payload,
    p_paid_at: event.paidAt,
    p_provider_subscription_id: event.providerSubscriptionId ?? null,
    p_period_start: event.periodStart ?? null,
    p_period_end: event.periodEnd ?? null,
  });
  if (error) throw new Error(`PAYMENT_FINALIZE_FAILED: ${error.message}`);
  return data ?? null;
}
