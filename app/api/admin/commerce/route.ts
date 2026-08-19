import { NextResponse } from 'next/server';
import { getAdminAccess } from '@/lib/admin/admin-access';
import { getAdminCommerce } from '@/lib/admin/commerce-service';

export async function GET() {
  const access = await getAdminAccess();
  if (access.status === 'unauthenticated') return NextResponse.json({ error: 'Silakan masuk.', code: 'AUTH_REQUIRED' }, { status: 401 });
  if (access.status === 'forbidden') return NextResponse.json({ error: 'Akses admin diperlukan.', code: 'ADMIN_REQUIRED' }, { status: 403 });

  try {
    return NextResponse.json({ data: await getAdminCommerce() });
  } catch (error) {
    console.error('Admin commerce failed', error);
    return NextResponse.json({ error: 'Gagal memuat monetisasi.', code: 'ADMIN_COMMERCE_FAILED' }, { status: 500 });
  }
}
