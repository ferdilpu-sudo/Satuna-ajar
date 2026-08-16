import { CheckCircle2, Save, X } from 'lucide-react';
import type { RPPData } from '../../types/rpp';
import ActivitiesEditor from './ActivitiesEditor';
import AssessmentEditor from './AssessmentEditor';
import IdentityEditor from './IdentityEditor';
import ModuleContentEditor from './ModuleContentEditor';
import ObjectivesEditor from './ObjectivesEditor';
import SourcesEditor from './SourcesEditor';

interface Props { rpp: RPPData; onChange: (rpp: RPPData) => void; onSave: () => void; onCancel: () => void; }

export default function InlineRPPReviewEditor({ rpp, onChange, onSave, onCancel }: Props) {
  return <section className="overflow-hidden rounded-2xl border border-blue-200 bg-[#F8FAFF] shadow-sm">
    <header className="flex flex-col gap-3 border-b border-blue-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div><p className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><CheckCircle2 className="h-4 w-4 text-blue-600" />Review & Sunting Dokumen</p><p className="mt-1 text-[11px] text-slate-500">Sunting langsung di halaman hasil. Preview di bawah akan berubah secara real time.</p></div>
      <div className="flex gap-2"><button type="button" onClick={onCancel} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><X className="h-4 w-4" />Batalkan</button><button type="button" onClick={onSave} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"><Save className="h-4 w-4" />Simpan Perubahan</button></div>
    </header>
    <div className="space-y-3 p-3 sm:p-4">
      <IdentityEditor rpp={rpp} onChange={onChange} />
      <ObjectivesEditor rpp={rpp} onChange={onChange} />
      <ActivitiesEditor rpp={rpp} onChange={onChange} />
      <AssessmentEditor rpp={rpp} onChange={onChange} />
      <ModuleContentEditor rpp={rpp} onChange={onChange} />
      <SourcesEditor rpp={rpp} onChange={onChange} />
    </div>
  </section>;
}
