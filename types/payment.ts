export type PaymentProviderName = 'ipaymu' | 'midtrans';
export type BillingType = 'subscription' | 'one_time';
export type CheckoutOrderStatus = 'created' | 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded';

export interface PublicPlan {
  code: string;
  name: string;
  billingType: BillingType;
  priceAmount: number;
  currency: string;
  generationQuota: number | null;
  intervalUnit: 'month' | 'year' | null;
}

export interface ProviderCheckoutInput {
  orderId: string;
  plan: PublicPlan;
  customer: {
    id: string;
    email: string | null;
    name: string | null;
  };
  returnUrl: string;
}

export interface ProviderCheckoutResult {
  providerReference: string;
  checkoutUrl: string;
  expiresAt: string | null;
}

export interface VerifiedPaymentEvent {
  provider: PaymentProviderName;
  eventId: string;
  eventType: string;
  orderId: string;
  providerPaymentId: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  amount: number;
  currency: string;
  paidAt: string | null;
  providerSubscriptionId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  payload: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createCheckout(input: ProviderCheckoutInput): Promise<ProviderCheckoutResult>;
  verifyWebhook(request: Request): Promise<VerifiedPaymentEvent>;
}
