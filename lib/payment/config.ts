import 'server-only';
import type { PaymentProviderName } from '@/types/payment';

export function getConfiguredPaymentProvider(): PaymentProviderName | null {
  const raw = process.env.SATUNA_PAYMENT_PROVIDER?.trim().toLowerCase();
  if (!raw) return null;
  if (raw === 'ipaymu' || raw === 'midtrans') return raw;
  throw new Error(`UNSUPPORTED_PAYMENT_PROVIDER_CONFIG: ${raw}`);
}
