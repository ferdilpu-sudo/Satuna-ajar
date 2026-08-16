'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StreamlineDuotoneIcon from '@/components/icons/StreamlineDuotoneIcon';
import { createClient } from '@/lib/supabase/client';

type AccountState = { loading: boolean; email: string; configured: boolean };

export default function AccountSection() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountState>({ loading: true, email: '', configured: true });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (active) setAccount({ loading: false, email: data.user?.email || '', configured: true });
      });
    } catch {
      setAccount({ loading: false, email: '', configured: false });
    }
    return () => { active = false; };
  }, []);

  const signOut = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/login');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DDE3DC] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#E6EAE5] px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><StreamlineDuotoneIcon name="profile" className="h-5 w-5" /></div>
        <div><h2 className="font-extrabold text-slate-900">Akun Satuna</h2><p className="text-xs text-slate-500">Autentikasi dan sesi akun Anda.</p></div>
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-bold text-slate-800">{account.loading ? 'Memuat akun...' : account.email || (account.configured ? 'Belum masuk' : 'Supabase belum dikonfigurasi')}</p>
          <p className="mt-1 text-xs text-slate-500">{account.email ? 'Sesi disimpan menggunakan Supabase Auth.' : 'Aktifkan autentikasi melalui environment sebelum production.'}</p>
        </div>
        {account.email && (
          <button type="button" disabled={busy} onClick={signOut} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            <LogOut className="h-4 w-4" />{busy ? 'Keluar...' : 'Keluar'}
          </button>
        )}
      </div>
    </section>
  );
}
