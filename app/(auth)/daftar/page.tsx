import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Daftar | ${BRAND.name}`,
  description: `Buat akun ${BRAND.name} dan mulai menyiapkan perangkat pembelajaran dalam satu ruang kerja.`,
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Mulai dengan Satuna Ajar"
      title="Buat akun guru Anda"
      description="Buat akun untuk mengamankan akses, kuota, dan identitas Satuna Ajar Anda."
    >
      <RegisterForm />
    </AuthShell>
  );
}
