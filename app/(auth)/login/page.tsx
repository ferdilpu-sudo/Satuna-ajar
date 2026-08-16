import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Masuk | ${BRAND.name}`,
  description: `Masuk ke ${BRAND.name} untuk melanjutkan pekerjaan mengajar Anda.`,
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Selamat datang kembali"
      title="Masuk ke ruang kerja Anda"
      description="Lanjutkan perangkat ajar, asesmen, dan dokumen pembelajaran yang sudah Anda siapkan."
    >
      <LoginForm />
    </AuthShell>
  );
}
