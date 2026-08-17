'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthField from './AuthField';
import GoogleMark from './GoogleMark';
import { createClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth/messages';

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const googleRegister = async () => {
    setLoading(true);
    setNotice('');
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) setNotice(friendlyAuthError(error.message));
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'SUPABASE_NOT_CONFIGURED'
        ? 'Supabase belum dikonfigurasi. Isi environment autentikasi terlebih dahulu.'
        : 'Tidak dapat memulai pendaftaran Google.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const accepted = data.get('terms') === 'on';
    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = 'Masukkan nama lengkap Anda.';
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Masukkan alamat email yang valid.';
    if (password.length < 8) nextErrors.password = 'Gunakan minimal 8 karakter.';
    if (!accepted) nextErrors.terms = 'Persetujuan diperlukan untuk membuat akun.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setNotice('');
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (error) return setNotice(friendlyAuthError(error.message));
      if (authData.session) {
        router.replace('/');
        router.refresh();
        return;
      }
      setNotice('Akun dibuat. Buka email verifikasi dari Satuna Ajar sebelum masuk.');
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'SUPABASE_NOT_CONFIGURED'
        ? 'Supabase belum dikonfigurasi. Isi environment autentikasi terlebih dahulu.'
        : 'Tidak dapat membuat akun saat ini. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4.5" noValidate>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800"><strong className="font-extrabold">Coba gratis</strong> · Buat hingga 3 dokumen dengan AI.</div>
      <button type="button" disabled={loading} onClick={googleRegister} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><GoogleMark />Daftar dengan Google</button>
      <div className="flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">atau dengan email</span><span className="h-px flex-1 bg-slate-200" /></div>
      <AuthField id="register-name" name="name" type="text" autoComplete="name" label="Nama lengkap" placeholder="Nama Anda" icon={<UserRound className="h-[18px] w-[18px]" />} error={errors.name} />
      <AuthField id="register-email" name="email" type="email" autoComplete="email" label="Email" placeholder="nama@sekolah.sch.id" icon={<Mail className="h-[18px] w-[18px]" />} error={errors.email} />
      <AuthField id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" label="Kata sandi" placeholder="Minimal 8 karakter" icon={<LockKeyhole className="h-[18px] w-[18px]" />} error={errors.password} trailing={(
        <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)} className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}</button>
      )} />
      <div><label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-600"><input name="terms" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" /><span>Saya menyetujui Syarat Penggunaan dan Kebijakan Privasi Satuna Ajar.</span></label>{errors.terms && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.terms}</p>}</div>
      {notice && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800">{notice}</div>}
      <button disabled={loading} type="submit" className="min-h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Memproses...' : 'Buat akun gratis'}</button>
      <p className="text-center text-sm text-slate-500">Sudah punya akun? <Link href="/login" className="font-extrabold text-blue-600 hover:text-blue-700">Masuk</Link></p>
    </form>
  );
}
