import { ArrowRight } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { SchoolIdentity } from '../../types/rpp';
import { expectedPhaseForGrade, formatPhase } from '../../lib/validation';

const INPUT_CLASS = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white';
const NAV_PRIMARY = 'min-h-10 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5';

const SUBJECT_OPTIONS = [
  'IPA', 'IPS', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris',
  'Pendidikan Pancasila', 'Informatika', 'PJOK', 'Pendidikan Agama Islam',
  'Fisika', 'Kimia', 'Biologi', 'Sejarah', 'Geografi', 'Sosiologi', 'Ekonomi',
  'Prakarya dan Kewirausahaan (PKWU)', 'Seni Budaya', 'Bimbingan Konseling (BK)',
];

const GRADE_OPTIONS = [
  'Kelas I', 'Kelas II', 'Kelas III', 'Kelas IV', 'Kelas V', 'Kelas VI',
  'Kelas VII', 'Kelas VIII', 'Kelas IX', 'Kelas X', 'Kelas XI', 'Kelas XII',
];

interface Props {
  documentName: 'RPP' | 'Modul Ajar';
  identity: SchoolIdentity;
  validationMessages: string[];
  warningMessages: string[];
  onChange: (field: keyof SchoolIdentity, value: string | number) => void;
  onContinue: () => void;
}

export default function IdentityStep({ documentName, identity, validationMessages, warningMessages, onChange, onContinue }: Props) {
  const expectedPhase = expectedPhaseForGrade(identity.grade);
  const isAutoPhase = Boolean(expectedPhase && identity.phase === expectedPhase);

  return (
    <section className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><StreamlineDuotoneIcon name="profile" className="h-5 w-5 text-blue-600" />Identitas Pembelajaran</h2>
        <p className="mt-1 text-sm text-slate-500">Tentukan identitas {documentName} terlebih dahulu. Elemen, topik, subtopik, materi, dan CP dilengkapi pada langkah berikutnya.</p>
      </div>

      {validationMessages.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <b>Periksa identitas sebelum lanjut:</b>
          <ul className="list-disc pl-5 mt-1">{validationMessages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      {warningMessages.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <b>Catatan verifikasi:</b>
          <ul className="list-disc pl-5 mt-1">{warningMessages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
        <Field label="Nama Penyusun" value={identity.teacherName} onChange={(v) => onChange('teacherName', v)} />
        <Field label="Nama Sekolah" value={identity.schoolName} onChange={(v) => onChange('schoolName', v)} />
        <Field label="Tahun Pelajaran" value={identity.academicYear} onChange={(v) => onChange('academicYear', v)} />

        <div>
          <label className="mb-1 block font-bold text-slate-700">Jenjang</label>
          <select value={identity.educationLevel} onChange={(e) => onChange('educationLevel', e.target.value)} className={INPUT_CLASS}>
            <option value="">Pilih jenjang...</option><option value="SD/MI">SD/MI</option><option value="SMP/MTs">SMP/MTs</option><option value="SMA/MA">SMA/MA</option><option value="SMK/MAK">SMK/MAK</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Mata Pelajaran</label>
          <input
            list="subject-list"
            value={identity.subject}
            onChange={(e) => onChange('subject', e.target.value)}
            placeholder="Ketik/Pilih misal: IPA, Matematika..."
            className={INPUT_CLASS}
          />
          <datalist id="subject-list">
            {SUBJECT_OPTIONS.map((sub) => <option key={sub} value={sub} />)}
          </datalist>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Kelas / Fase</label>
            {isAutoPhase && (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <StreamlineDuotoneIcon name="magic" className="h-2.5 w-2.5" /> Otomatis Fase {expectedPhase}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              list="grade-list"
              value={identity.grade}
              onChange={(e) => onChange('grade', e.target.value)}
              placeholder="Kelas IX"
              className={`w-1/2 ${INPUT_CLASS}`}
            />
            <datalist id="grade-list">
              {GRADE_OPTIONS.map((grd) => <option key={grd} value={grd} />)}
            </datalist>
            <select value={identity.phase} onChange={(e) => onChange('phase', e.target.value)} className={`w-1/2 ${INPUT_CLASS}`}>
              <option value="">Pilih fase...</option>{['A','B','C','D','E','F'].map((phase) => <option key={phase} value={phase}>{formatPhase(phase)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Semester</label>
          <select value={identity.semester} onChange={(e) => onChange('semester', e.target.value)} className={INPUT_CLASS}><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select>
        </div>

      </div>

      <div className="space-y-3 rounded-2xl border border-[#E1E6E0] bg-[#F8FAF7] p-4">
        <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><StreamlineDuotoneIcon name="history" className="h-4 w-4 text-blue-600" />Alokasi Waktu</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <NumberField label="Jumlah JP" value={identity.jpCount} onChange={(v) => onChange('jpCount', v)} />
          <NumberField label="Durasi 1 JP (Menit)" value={identity.durationPerJP} onChange={(v) => onChange('durationPerJP', v)} />
          <NumberField label="Jumlah Pertemuan" value={identity.meetingCount} onChange={(v) => onChange('meetingCount', v)} />
        </div>
        <div className="rounded-xl border border-white bg-white p-2.5 text-center text-xs font-bold text-slate-700">TOTAL: {identity.jpCount} JP × {identity.durationPerJP} menit × {identity.meetingCount} = <span className="text-blue-700">{identity.totalMinutes} menit</span></div>
      </div>

      <div className="flex justify-end border-t border-[#E6EAE5] pt-4">
        <button type="button" disabled={validationMessages.length > 0} onClick={onContinue} className={`${NAV_PRIMARY} disabled:cursor-not-allowed disabled:opacity-40`}>Lanjut ke Materi<ArrowRight className="w-4 h-4" /></button>
      </div>

    </section>
  );
}

function Field({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div><label className="mb-1 block font-bold text-slate-700">{label}</label><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} /></div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><label className="mb-1 block font-semibold text-slate-700">{label}</label><input type="number" min={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className={INPUT_CLASS} /></div>;
}
