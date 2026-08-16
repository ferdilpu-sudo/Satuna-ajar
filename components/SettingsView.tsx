'use client';

import React, { useState } from 'react';
import { Check, Save } from 'lucide-react';
import StreamlineDuotoneIcon from './icons/StreamlineDuotoneIcon';
import { getUserSettings, saveUserSettings, type UserSettings } from '@/lib/storage';
import { BRAND } from '@/lib/brand';
import AccountSection from './settings/AccountSection';

const FIELD = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white';

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    saveUserSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Preferensi</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Profil & default dokumen</h1>
        <p className="mt-1 text-sm text-slate-500">Atur identitas default yang digunakan saat membuat dokumen baru.</p>
      </section>

      <form onSubmit={handleSave} className="space-y-6">
        <AccountSection />
        <div className="overflow-hidden rounded-2xl border border-[#DDE3DC] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E6EAE5] px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><StreamlineDuotoneIcon name="profile" className="h-5 w-5" /></div>
          <div><h2 className="font-extrabold text-slate-900">Identitas default</h2><p className="text-xs text-slate-500">Digunakan saat membuat dokumen baru.</p></div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Nama Guru / Penyusun"><input value={settings.defaultTeacherName} onChange={(e) => setSettings({ ...settings, defaultTeacherName: e.target.value })} className={FIELD} /></Field>
          <Field label="Nama Satuan Pendidikan"><input value={settings.defaultSchoolName} onChange={(e) => setSettings({ ...settings, defaultSchoolName: e.target.value })} className={FIELD} /></Field>
          <Field label="Tahun Pelajaran"><input value={settings.defaultAcademicYear} onChange={(e) => setSettings({ ...settings, defaultAcademicYear: e.target.value })} className={FIELD} /></Field>
          <Field label="Jenjang Default">
            <select value={settings.defaultLevel} onChange={(e) => setSettings({ ...settings, defaultLevel: e.target.value })} className={FIELD}>
              <option value="">Pilih jenjang...</option><option value="SD/MI">SD/MI</option><option value="SMP/MTs">SMP/MTs</option><option value="SMA/MA">SMA/MA</option><option value="SMK/MAK">SMK/MAK</option>
            </select>
          </Field>
        </div>

        </div>


        <div className="flex justify-end rounded-2xl border border-[#DDE3DC] bg-[#FAFBF9] px-5 py-4 shadow-sm sm:px-6">
          <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? 'Tersimpan' : 'Simpan Pengaturan'}
          </button>
        </div>

        <details className="group rounded-2xl border border-[#E3E7E2] bg-white shadow-sm">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-bold text-slate-700 marker:hidden sm:px-6">
            <span className="flex items-center gap-2"><StreamlineDuotoneIcon name="info" className="h-4 w-4 text-blue-600" />Tentang & Lisensi</span>
            <span className="text-xs font-semibold text-slate-400 transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="border-t border-[#EEF1ED] px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
            <p><b className="text-slate-700">{BRAND.name}</b> · {BRAND.tagline}</p>
            <p className="mt-2">Ikon antarmuka menggunakan aset gratis Streamline.</p>
            <a href="https://streamlinehq.com" target="_blank" rel="noreferrer" className="mt-1 inline-flex font-semibold text-blue-700 hover:text-blue-800 hover:underline">Free icons from Streamline</a>
          </div>
        </details>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5"><span className="block text-xs font-bold text-slate-700">{label}</span>{children}</label>;
}
