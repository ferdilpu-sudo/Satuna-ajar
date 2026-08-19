import { NextResponse } from 'next/server';
import { listPublicPlans } from '@/lib/payment/catalog-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await listPublicPlans();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Public billing plans failed', error);
    return NextResponse.json(
      { error: 'Gagal memuat paket Satuna.', code: 'BILLING_PLANS_FAILED' },
      { status: 500 },
    );
  }
}
