import { notFound, redirect } from 'next/navigation';
import { getAdminAccess } from '@/lib/admin/admin-access';

export async function requireAdmin() {
  const access = await getAdminAccess();

  if (access.status === 'unauthenticated') {
    redirect('/login?next=/admin');
  }

  if (access.status === 'forbidden') {
    notFound();
  }

  return access.user;
}
