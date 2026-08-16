'use client';

import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthField from './AuthField';
import { createClient } from '@/lib/supabase/client';
import { friendlyAuthError } from '@/lib/auth/messages';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') || '');
    if (password.length < 8) return setError('Gunakan minimal 8 karakter.');
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) return setNotice(friendlyAuthError(authError.message));
      setNotice('Kata sandi berhasil diperbarui.');
      window.setTimeout(() => { router.replace('/'); router.refresh(); }, 700);
    } catch {
      setNotice('Sesi pemulihan tidak tersedia. Minta tautan pemulihan baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <AuthField id="new-password" name="password" type={show ? 'text' : 'password'} autoComplete="new-password" label="Kata sandi baru" placeholder="Minimal 8 karakter" icon={<LockKeyhole className="h-[18px] w-[18px]" />} error={error} trailing={(
        <button type="button" aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShow((value) => !value)} className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">{show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}</button>
      )} />
      {notice && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800">{notice}</div>}
      <button disabled={loading} type="submit" className="min-h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{loading ? 'Menyimpan...' : 'Simpan kata sandi baru'}</button>
    </form>
  );
}
