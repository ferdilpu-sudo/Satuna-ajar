import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = { title: `Ubah Kata Sandi | ${BRAND.name}` };

export default function UpdatePasswordPage() {
  return (
    <AuthShell eyebrow="Keamanan akun" title="Buat kata sandi baru" description="Gunakan kata sandi yang berbeda dari kata sandi lama dan mudah Anda ingat.">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
