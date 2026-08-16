import type { LearningActivityItem, RPPData } from '../../types/rpp';
import { EditorSection, Field, TextArea, TextInput } from './EditorPrimitives';

const EXPERIENCES: LearningActivityItem['experience'][] = ['MEMAHAMI', 'MENGAPLIKASI', 'MEREFLEKSI'];

export default function ActivitiesEditor({ rpp, onChange }: { rpp: RPPData; onChange: (rpp: RPPData) => void }) {
  const update = (index: number, patch: Partial<LearningActivityItem>) => {
    const activities = [...rpp.activities];
    activities[index] = { ...activities[index], ...patch };
    onChange({ ...rpp, activities });
  };

  return <EditorSection title="Langkah Pembelajaran" description="Sunting waktu, tahap model, kegiatan, pengalaman, dan dukungan guru.">
    <div className="space-y-4">{rpp.activities.map((activity, index) => <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Tahap"><TextInput value={activity.stage} onChange={(e) => update(index, { stage: e.target.value as LearningActivityItem['stage'] })} /></Field>
        <Field label="Pertemuan"><TextInput type="number" min={1} value={activity.meetingNumber || 1} onChange={(e) => update(index, { meetingNumber: Number(e.target.value) || 1 })} /></Field>
        <Field label="Waktu (menit)"><TextInput type="number" min={1} value={activity.timeMinutes} onChange={(e) => update(index, { timeMinutes: Number(e.target.value) || 1 })} /></Field>
        <Field label="Pengalaman"><select value={activity.experience} onChange={(e) => update(index, { experience: e.target.value as LearningActivityItem['experience'] })} className="w-full rounded-lg border border-[#DDE3DC] bg-white px-3 py-2 text-xs">{EXPERIENCES.map((value) => <option key={value}>{value}</option>)}</select></Field>
      </div>
      <div className="mt-3"><Field label="Tahap Model / Prinsip"><TextInput value={activity.syntaxOrPrinciple} onChange={(e) => update(index, { syntaxOrPrinciple: e.target.value })} /></Field></div>
      <div className="mt-3"><Field label="Deskripsi Kegiatan"><TextArea rows={4} value={activity.description} onChange={(e) => update(index, { description: e.target.value })} /></Field></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Prinsip Deep Learning"><TextInput value={(activity.deepLearningBadges || []).join(', ')} onChange={(e) => update(index, { deepLearningBadges: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) as LearningActivityItem['deepLearningBadges'] })} /></Field>
        <Field label="Dukungan Guru"><TextArea rows={2} value={activity.scaffoldingNotes || ''} onChange={(e) => update(index, { scaffoldingNotes: e.target.value })} /></Field>
      </div>
    </div>)}</div>
  </EditorSection>;
}
