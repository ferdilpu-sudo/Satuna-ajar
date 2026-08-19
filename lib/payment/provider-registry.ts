import 'server-only';
import { getConfiguredPaymentProvider } from '@/lib/payment/config';
import type { PaymentProvider, PaymentProviderName } from '@/types/payment';

type ProviderFactory = () => PaymentProvider;

// Provider adapters are registered here only after their merchant account and
// credentials are ready. Keeping the registry empty prevents accidental live
// checkout while iPaymu/Midtrans review is still in progress.
const providerFactories: Partial<Record<PaymentProviderName, ProviderFactory>> = {};

export interface PaymentRuntimeStatus {
  configuredProvider: PaymentProviderName | null;
  checkoutEnabled: boolean;
}

export function getPaymentRuntimeStatus(): PaymentRuntimeStatus {
  const configuredProvider = getConfiguredPaymentProvider();
  return {
    configuredProvider,
    checkoutEnabled: Boolean(configuredProvider && providerFactories[configuredProvider]),
  };
}

export function getActivePaymentProvider(): PaymentProvider | null {
  const configuredProvider = getConfiguredPaymentProvider();
  if (!configuredProvider) return null;
  return providerFactories[configuredProvider]?.() ?? null;
}
