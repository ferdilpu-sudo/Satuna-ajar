import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = { title: `Lupa Kata Sandi | ${BRAND.name}` };

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Pemulihan akun" title="Atur ulang kata sandi" description="Masukkan email akun. Kami akan mengirim tautan aman untuk membuat kata sandi baru.">
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
