'use client';

import React, { useState } from 'react';
import type { RPPData } from '@/types/rpp';
import { Save, X } from 'lucide-react';

interface RPPEditorModalProps { rpp: RPPData; isOpen: boolean; onClose: () => void; onSaveRPP: (updatedRPP: RPPData) => void; }
const INPUT = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white';

export default function RPPEditorModal({ rpp, isOpen, onClose, onSaveRPP }: RPPEditorModalProps) {
  const [editedRPP, setEditedRPP] = useState<RPPData>(JSON.parse(JSON.stringify(rpp)));
  if (!isOpen) return null;

  const save = () => { onSaveRPP(editedRPP); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DDE3DC] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E6EAE5] px-5 py-4 sm:px-6">
          <div><h2 className="font-extrabold text-slate-900">Edit Detail RPP / Modul Ajar</h2><p className="text-xs text-slate-500">Perbarui identitas dan komponen utama dokumen.</p></div>
          <button type="button" onClick={onClose} aria-label="Tutup editor" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5 text-xs sm:p-6 sm:text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mata Pelajaran"><input value={editedRPP.identity.subject} onChange={(e) => setEditedRPP({ ...editedRPP, identity: { ...editedRPP.identity, subject: e.target.value } })} className={INPUT} /></Field>
            <Field label="Topik / Materi"><input value={editedRPP.identity.topic} onChange={(e) => setEditedRPP({ ...editedRPP, identity: { ...editedRPP.identity, topic: e.target.value } })} className={INPUT} /></Field>
            <Field label="Kelas"><input value={editedRPP.identity.grade} onChange={(e) => setEditedRPP({ ...editedRPP, identity: { ...editedRPP.identity, grade: e.target.value } })} className={INPUT} /></Field>
            <Field label="Model Pembelajaran"><input value={editedRPP.learningSettings.model} onChange={(e) => setEditedRPP({ ...editedRPP, learningSettings: { ...editedRPP.learningSettings, model: e.target.value } })} className={INPUT} /></Field>
          </div>
          <Field label="Capaian Pembelajaran (CP)"><textarea rows={4} value={editedRPP.identity.learningOutcomes} onChange={(e) => setEditedRPP({ ...editedRPP, identity: { ...editedRPP.identity, learningOutcomes: e.target.value } })} className={INPUT} /></Field>
          <div className="space-y-2"><p className="text-xs font-bold text-slate-700">Tujuan Pembelajaran (TP)</p>{editedRPP.learningObjectives?.map((objective, index) => <input key={index} value={objective} onChange={(e) => { const objectives = [...editedRPP.learningObjectives]; objectives[index] = e.target.value; setEditedRPP({ ...editedRPP, learningObjectives: objectives }); }} className={INPUT} />)}</div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-[#E6EAE5] bg-[#FAFBF9] px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-[#DDE3DC] bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Batal</button>
          <button type="button" onClick={save} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"><Save className="h-4 w-4" />Simpan Perubahan</button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span>{children}</label>;
}
