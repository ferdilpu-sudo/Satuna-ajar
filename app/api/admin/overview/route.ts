import { NextResponse } from 'next/server';
import { getAdminAccess } from '@/lib/admin/admin-access';
import { getAdminOverviewMetrics } from '@/lib/admin/overview-service';

export async function GET() {
  const access = await getAdminAccess();

  if (access.status === 'unauthenticated') {
    return NextResponse.json(
      { error: 'Silakan masuk untuk melanjutkan.', code: 'AUTH_REQUIRED' },
      { status: 401 },
    );
  }

  if (access.status === 'forbidden') {
    return NextResponse.json(
      { error: 'Akses admin diperlukan.', code: 'ADMIN_REQUIRED' },
      { status: 403 },
    );
  }

  try {
    const data = await getAdminOverviewMetrics();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin overview failed', error);
    return NextResponse.json(
      { error: 'Gagal memuat ringkasan admin.', code: 'ADMIN_OVERVIEW_FAILED' },
      { status: 500 },
    );
  }
}
