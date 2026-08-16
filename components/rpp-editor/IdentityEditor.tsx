import type { RPPData, SchoolIdentity } from '../../types/rpp';
import { EditorSection, Field, TextArea, TextInput } from './EditorPrimitives';

export default function IdentityEditor({ rpp, onChange }: { rpp: RPPData; onChange: (rpp: RPPData) => void }) {
  const identity = rpp.identity;
  const update = (patch: Partial<SchoolIdentity>) => {
    const next = { ...identity, ...patch };
    const totalMinutes = Math.max(1, Number(next.jpCount) || 1) * Math.max(1, Number(next.durationPerJP) || 1) * Math.max(1, Number(next.meetingCount) || 1);
    onChange({ ...rpp, identity: { ...next, totalMinutes } });
  };

  return <EditorSection title="Identitas & Capaian Pembelajaran" description="Semua perubahan langsung terlihat pada preview dokumen." open>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Nama Penyusun"><TextInput value={identity.teacherName} onChange={(e) => update({ teacherName: e.target.value })} /></Field>
      <Field label="Satuan Pendidikan"><TextInput value={identity.schoolName} onChange={(e) => update({ schoolName: e.target.value })} /></Field>
      <Field label="Tahun Pelajaran"><TextInput value={identity.academicYear} onChange={(e) => update({ academicYear: e.target.value })} /></Field>
      <Field label="Mata Pelajaran"><TextInput value={identity.subject} onChange={(e) => update({ subject: e.target.value })} /></Field>
      <Field label="Kelas"><TextInput value={identity.grade} onChange={(e) => update({ grade: e.target.value })} /></Field>
      <Field label="Fase"><TextInput value={identity.phase} onChange={(e) => update({ phase: e.target.value })} /></Field>
      <Field label="Semester"><TextInput value={identity.semester} onChange={(e) => update({ semester: e.target.value })} /></Field>
      <Field label="Elemen" hint="Mengubah Elemen menandainya sebagai input guru."><TextInput value={identity.element} onChange={(e) => update({ element: e.target.value, elementSource: 'manual' })} /></Field>
      <Field label="Topik"><TextInput value={identity.topic} onChange={(e) => update({ topic: e.target.value })} /></Field>
      <Field label="Subtopik"><TextInput value={identity.subtopic} onChange={(e) => update({ subtopic: e.target.value })} /></Field>
      <Field label="Jumlah JP"><TextInput type="number" min={1} value={identity.jpCount} onChange={(e) => update({ jpCount: Number(e.target.value) || 1 })} /></Field>
      <Field label="Durasi 1 JP (menit)"><TextInput type="number" min={1} value={identity.durationPerJP} onChange={(e) => update({ durationPerJP: Number(e.target.value) || 1 })} /></Field>
      <Field label="Jumlah Pertemuan"><TextInput type="number" min={1} value={identity.meetingCount} onChange={(e) => update({ meetingCount: Number(e.target.value) || 1 })} /></Field>
    </div>
    <div className="mt-3"><Field label="Capaian Pembelajaran (CP)" hint="Mengubah CP menandainya sebagai input guru."><TextArea rows={4} value={identity.learningOutcomes} onChange={(e) => update({ learningOutcomes: e.target.value, cpSource: 'manual' })} /></Field></div>
  </EditorSection>;
}
