'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthField from './AuthField';
import GoogleMark from './GoogleMark';
import { createClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth/messages';

function safeNext(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get('next')));
    if (params.get('error')) setNotice('Sesi masuk tidak dapat diselesaikan. Silakan coba lagi.');
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    setNotice('');
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) setNotice(friendlyAuthError(error.message));
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'SUPABASE_NOT_CONFIGURED'
        ? 'Supabase belum dikonfigurasi. Isi environment autentikasi terlebih dahulu.'
        : 'Tidak dapat memulai login Google.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const nextErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Masukkan alamat email yang valid.';
    if (!password) nextErrors.password = 'Masukkan kata sandi.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setNotice('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setNotice(friendlyAuthError(error.message));
      router.replace(next);
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'SUPABASE_NOT_CONFIGURED'
        ? 'Supabase belum dikonfigurasi. Isi environment autentikasi terlebih dahulu.'
        : 'Tidak dapat masuk saat ini. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <button type="button" disabled={loading} onClick={googleLogin} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
        <GoogleMark />Lanjutkan dengan Google
      </button>

      <div className="flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">atau dengan email</span><span className="h-px flex-1 bg-slate-200" /></div>

      <AuthField id="login-email" name="email" type="email" autoComplete="email" label="Email" placeholder="nama@sekolah.sch.id" icon={<Mail className="h-[18px] w-[18px]" />} error={errors.email} />
      <AuthField id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" label="Kata sandi" placeholder="Masukkan kata sandi" icon={<LockKeyhole className="h-[18px] w-[18px]" />} error={errors.password} trailing={(
        <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)} className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      )} />

      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-slate-500">Sesi masuk disimpan aman di cookie.</span>
        <Link href="/lupa-kata-sandi" className="font-bold text-blue-600 hover:text-blue-700">Lupa kata sandi?</Link>
      </div>

      {notice && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800">{notice}</div>}
      <button disabled={loading} type="submit" className="min-h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Memproses...' : 'Masuk ke Satuna Ajar'}</button>
      <p className="text-center text-sm text-slate-500">Belum punya akun? <Link href="/daftar" className="font-extrabold text-blue-600 hover:text-blue-700">Daftar gratis</Link></p>
    </form>
  );
}
