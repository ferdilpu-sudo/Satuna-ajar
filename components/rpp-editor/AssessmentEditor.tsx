import type { DiagnosticQuestion, QuizQuestion, RPPData } from '../../types/rpp';
import { EditorSection, Field, TextArea, TextInput } from './EditorPrimitives';

export default function AssessmentEditor({ rpp, onChange }: { rpp: RPPData; onChange: (rpp: RPPData) => void }) {
  const updateDiagnostic = (kind: 'diagnosticNonCognitive' | 'diagnosticCognitive', index: number, patch: Partial<DiagnosticQuestion>) => {
    const items = [...rpp.assessment[kind]];
    items[index] = { ...items[index], ...patch };
    onChange({ ...rpp, assessment: { ...rpp.assessment, [kind]: items } });
  };
  const updateFormative = (index: number, patch: Partial<RPPData['assessment']['formative'][number]>) => {
    const formative = [...rpp.assessment.formative];
    formative[index] = { ...formative[index], ...patch };
    onChange({ ...rpp, assessment: { ...rpp.assessment, formative } });
  };
  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    const summativeQuestions = [...rpp.assessment.summativeQuestions];
    summativeQuestions[index] = { ...summativeQuestions[index], ...patch };
    onChange({ ...rpp, assessment: { ...rpp.assessment, summativeQuestions } });
  };

  const diagnostics = [
    ...rpp.assessment.diagnosticNonCognitive.map((item, index) => ({ item, index, kind: 'diagnosticNonCognitive' as const })),
    ...rpp.assessment.diagnosticCognitive.map((item, index) => ({ item, index, kind: 'diagnosticCognitive' as const })),
  ];

  return <EditorSection title="Asesmen" description="Review diagnostik, formatif, soal sumatif, kunci, indikator, dan pemetaan TP.">
    <div className="space-y-5">
      <div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Diagnostik</p><div className="space-y-3">{diagnostics.map(({ item, index, kind }, rowIndex) => <div key={`${kind}-${index}`} className="rounded-lg border border-slate-200 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`Pertanyaan ${rowIndex + 1}`}><TextArea rows={2} value={item.question} onChange={(e) => updateDiagnostic(kind, index, { question: e.target.value })} /></Field>
          <Field label="Kunci / Kriteria"><TextArea rows={2} value={item.keyOrCriteria || ''} onChange={(e) => updateDiagnostic(kind, index, { keyOrCriteria: e.target.value })} /></Field>
        </div>
      </div>)}</div></div>

      <div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Formatif</p><div className="space-y-3">{rpp.assessment.formative.map((item, index) => <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
        <Field label="Teknik"><TextInput value={item.technique} onChange={(e) => updateFormative(index, { technique: e.target.value })} /></Field>
        <Field label="Instrumen"><TextInput value={item.instrument} onChange={(e) => updateFormative(index, { instrument: e.target.value })} /></Field>
        <Field label="Waktu"><TextInput value={item.timing} onChange={(e) => updateFormative(index, { timing: e.target.value })} /></Field>
        <Field label="Tujuan"><TextInput value={item.purpose} onChange={(e) => updateFormative(index, { purpose: e.target.value })} /></Field>
      </div>)}</div></div>

      <div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Sumatif</p><div className="space-y-4">{rpp.assessment.summativeQuestions.map((question, index) => <div key={question.id || index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="ID"><TextInput value={question.id} onChange={(e) => updateQuestion(index, { id: e.target.value })} /></Field>
          <Field label="Jenis"><select value={question.type} onChange={(e) => updateQuestion(index, { type: e.target.value as QuizQuestion['type'] })} className="w-full rounded-lg border border-[#DDE3DC] bg-white px-3 py-2 text-xs">{['PG', 'Uraian', 'Kinerja', 'Produk'].map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Pemetaan TP"><TextInput value={question.objectiveMeasured} onChange={(e) => updateQuestion(index, { objectiveMeasured: e.target.value })} /></Field>
          <Field label="Peran Bukti"><select value={question.evidenceRole || 'PRIMARY'} onChange={(e) => updateQuestion(index, { evidenceRole: e.target.value as QuizQuestion['evidenceRole'] })} className="w-full rounded-lg border border-[#DDE3DC] bg-white px-3 py-2 text-xs"><option value="PRIMARY">Bukti utama</option><option value="SUPPORTING">Pendukung</option></select></Field>
        </div>
        <div className="mt-3"><Field label="Pertanyaan"><TextArea rows={3} value={question.question} onChange={(e) => updateQuestion(index, { question: e.target.value })} /></Field></div>
        {question.type === 'PG' ? <div className="mt-3"><Field label="Pilihan jawaban — satu pilihan per baris"><TextArea rows={5} value={(question.options || []).join('\n')} onChange={(e) => updateQuestion(index, { options: e.target.value.split('\n').filter(Boolean) })} /></Field></div> : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Jawaban / Kriteria"><TextArea rows={3} value={question.correctAnswer} onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })} /></Field>
          <Field label="Indikator"><TextArea rows={3} value={question.indicator} onChange={(e) => updateQuestion(index, { indicator: e.target.value })} /></Field>
        </div>
      </div>)}</div></div>
    </div>
  </EditorSection>;
}
