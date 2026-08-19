import { NextRequest, NextResponse } from 'next/server';
import { attachProviderCheckout, prepareCheckout } from '@/lib/payment/checkout-service';
import { getActivePaymentProvider, getPaymentRuntimeStatus } from '@/lib/payment/provider-registry';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface CheckoutRequestBody {
  planCode?: unknown;
  idempotencyKey?: unknown;
}

function validPlanCode(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,63}$/.test(value);
}

function validIdempotencyKey(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Silakan masuk untuk membeli paket.', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const body = await request.json().catch(() => null) as CheckoutRequestBody | null;
    if (!body || !validPlanCode(body.planCode) || !validIdempotencyKey(body.idempotencyKey)) {
      return NextResponse.json({ error: 'Permintaan checkout tidak valid.', code: 'INVALID_CHECKOUT_REQUEST' }, { status: 400 });
    }

    const runtime = getPaymentRuntimeStatus();
    if (!runtime.configuredProvider) {
      return NextResponse.json({
        error: 'Payment gateway sedang dalam proses aktivasi. Pembelian akan tersedia setelah provider disetujui.',
        code: 'PAYMENT_GATEWAY_REVIEW_PENDING',
      }, { status: 503 });
    }

    const provider = getActivePaymentProvider();
    if (!provider) {
      return NextResponse.json({
        error: `Adapter ${runtime.configuredProvider} belum diaktifkan pada server.`,
        code: 'PAYMENT_PROVIDER_ADAPTER_UNAVAILABLE',
      }, { status: 503 });
    }

    const prepared = await prepareCheckout(body.planCode, body.idempotencyKey);
    const returnUrl = new URL('/pricing', request.url);
    returnUrl.searchParams.set('checkout', 'return');
    returnUrl.searchParams.set('order', prepared.orderId);

    const providerCheckout = await provider.createCheckout({
      orderId: prepared.orderId,
      plan: prepared.plan,
      customer: prepared.user,
      returnUrl: returnUrl.toString(),
    });

    await attachProviderCheckout(prepared.orderId, provider.name, providerCheckout);

    return NextResponse.json({
      data: {
        orderId: prepared.orderId,
        provider: provider.name,
        checkoutUrl: providerCheckout.checkoutUrl,
        expiresAt: providerCheckout.expiresAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CHECKOUT_FAILED';
    console.error('Checkout failed:', error);

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Silakan masuk untuk membeli paket.', code: 'AUTH_REQUIRED' }, { status: 401 });
    }
    if (message.includes('PLAN_NOT_FOUND')) {
      return NextResponse.json({ error: 'Paket tidak ditemukan atau sudah tidak aktif.', code: 'PLAN_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Checkout belum dapat dibuat. Silakan coba kembali nanti.',
      code: 'CHECKOUT_FAILED',
    }, { status: 502 });
  }
}
