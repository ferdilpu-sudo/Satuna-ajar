import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';

interface Props { isRingkas: boolean; }

export default function RPPOutline({ isRingkas }: Props) {
  const items = isRingkas
    ? [
        ['rpp-identitas', 'A. Identitas RPP'],
        ['rpp-tujuan', 'B. Tujuan & KKTP'],
        ['rpp-kegiatan', 'C. Langkah Pembelajaran'],
        ['rpp-asesmen', 'D–E. Asesmen'],
        ['rpp-sumber', 'F. Sumber'],
      ]
    : [
        ['rpp-identitas', 'A. Identitas Modul'],
        ['rpp-dimensi', 'B. Dimensi Profil'],
        ['rpp-model', 'C. Model & Metode'],
        ['rpp-sarana', 'D. Sarana & Digital'],
        ['rpp-tujuan', 'E. TP & KKTP'],
        ['rpp-materi', 'F. Pemantik & Materi'],
        ['rpp-kegiatan', 'G. Langkah Pembelajaran'],
        ['rpp-asesmen-plan', 'H. Rencana Asesmen'],
        ['rpp-rubrik', 'I. Rubrik Penilaian'],
        ['rpp-refleksi', 'J. Refleksi & Remedial'],
        ['rpp-lkpd', 'L. Lampiran LKPD'],
        ['rpp-soal', 'M. Soal & Pemetaan'],
        ['rpp-sumber', 'N. Sumber'],
      ];

  return (
    <nav className="sticky top-24 rounded-2xl border border-[#DDE3DC] bg-white p-3 shadow-sm" aria-label="Outline dokumen">
      <div className="flex items-center gap-2 px-2 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400"><StreamlineDuotoneIcon name="document" className="h-4 w-4" />Outline</div>
      <div className="mt-1 space-y-0.5">
        {items.map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-2.5 py-2 text-xs font-semibold leading-5 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700">{label}</a>)}
      </div>
    </nav>
  );
}
