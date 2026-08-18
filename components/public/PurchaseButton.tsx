'use client';

import { useState } from 'react';

type BillingType = 'subscription' | 'one_time';

interface PurchaseButtonProps {
  planCode: string;
  billingType: BillingType;
  checkoutEnabled: boolean;
}

interface CheckoutResponse {
  data?: {
    checkoutUrl?: string;
  };
  error?: string;
  code?: string;
}

function checkoutStorageKey(planCode: string) {
  return `satuna:checkout:${planCode}`;
}

function getIdempotencyKey(planCode: string): string {
  const storageKey = checkoutStorageKey(planCode);
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(storageKey, created);
  return created;
}

export default function PurchaseButton({ planCode, billingType, checkoutEnabled }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startCheckout() {
    if (!checkoutEnabled || loading) return;

    setLoading(true);
    setMessage(null);
    try {
      const idempotencyKey = getIdempotencyKey(planCode);
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode, idempotencyKey }),
      });
      const payload = await response.json() as CheckoutResponse;

      if (response.status === 401 || payload.code === 'AUTH_REQUIRED') {
        window.location.assign(`/login?next=${encodeURIComponent('/pricing')}`);
        return;
      }

      if (!response.ok || !payload.data?.checkoutUrl) {
        throw new Error(payload.error || 'Checkout belum dapat dibuat.');
      }

      window.sessionStorage.removeItem(checkoutStorageKey(planCode));
      window.location.assign(payload.data.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout belum dapat dibuat.');
      setLoading(false);
    }
  }

  const label = billingType === 'subscription' ? 'Langganan Pro' : 'Beli paket';

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={startCheckout}
        disabled={!checkoutEnabled || loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {loading ? 'Menyiapkan checkout...' : checkoutEnabled ? label : 'Menunggu payment gateway'}
      </button>
      {!checkoutEnabled ? (
        <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">Pembelian akan aktif setelah payment gateway disetujui dan adapter server diaktifkan.</p>
      ) : null}
      {message ? <p role="alert" className="mt-2 text-center text-xs font-semibold text-rose-600">{message}</p> : null}
    </div>
  );
}
