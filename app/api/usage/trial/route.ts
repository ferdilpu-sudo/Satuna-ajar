import { NextRequest, NextResponse } from 'next/server';
import { getTrialStatus } from '@/lib/server/trial-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const status = await getTrialStatus(req);
    const response = NextResponse.json({
      trial: status.usage,
      enforced: status.enforced,
    });
    return status.attach(response);
  } catch (error) {
    console.error('Trial status unavailable:', error);
    return NextResponse.json({
      error: 'Status trial belum tersedia. Periksa konfigurasi server.',
      code: 'TRIAL_CONFIGURATION_ERROR',
    }, { status: 503 });
  }
}
