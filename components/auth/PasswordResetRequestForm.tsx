'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import AuthField from './AuthField';
import { createClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth/messages';

export default function PasswordResetRequestForm() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Masukkan alamat email yang valid.');
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/ubah-kata-sandi`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (authError) return setNotice(friendlyAuthError(authError.message));
      setNotice('Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.');
    } catch {
      setNotice('Pemulihan kata sandi belum tersedia karena autentikasi belum dikonfigurasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <AuthField id="reset-email" name="email" type="email" autoComplete="email" label="Email akun" placeholder="nama@sekolah.sch.id" icon={<Mail className="h-[18px] w-[18px]" />} error={error} />
      {notice && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800">{notice}</div>}
      <button disabled={loading} type="submit" className="min-h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{loading ? 'Mengirim...' : 'Kirim tautan pemulihan'}</button>
      <p className="text-center text-sm text-slate-500"><Link href="/login" className="font-extrabold text-blue-600 hover:text-blue-700">Kembali ke halaman masuk</Link></p>
    </form>
  );
}
