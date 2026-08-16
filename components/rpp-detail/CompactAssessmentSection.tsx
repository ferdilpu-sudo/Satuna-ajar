import type { RPPData } from '../../types/rpp';
import { getObjectiveEvidenceGroups } from '../../lib/validation/assessment';
import { formatChoiceOptions, getCompactDiagnostics, getCompactFormativeChecklist } from '../../lib/assessment-display';

export default function CompactAssessmentSection({ rpp }: { rpp: RPPData }) {
  const diagnostic = [...rpp.assessment.diagnosticNonCognitive, ...rpp.assessment.diagnosticCognitive];
  const formativeTechniques = [...new Set(rpp.assessment.formative.map((item) => item.technique).filter(Boolean))].join(', ');
  const formativeInstruments = [...new Set(rpp.assessment.formative.map((item) => item.instrument).filter(Boolean))].join(', ');
  const pgCount = rpp.assessment.summativeQuestions.filter((question) => question.type === 'PG').length;
  const essayCount = rpp.assessment.summativeQuestions.filter((question) => question.type === 'Uraian').length;
  const productTaskCount = rpp.assessment.summativeQuestions.filter((question) => question.type === 'Produk').length;
  const performanceTaskCount = rpp.assessment.summativeQuestions.filter((question) => question.type === 'Kinerja').length;
  const evidenceText = rpp.successCriteria.map((item) => item.assessmentEvidence).join(' ');
  const hasProduct = productTaskCount > 0 || /produk|karya|poster|infografis|kartu|portofolio/i.test(evidenceText);
  const hasPerformance = performanceTaskCount > 0 || /unjuk kerja|praktik|demonstrasi|presentasi/i.test(evidenceText);
  const authenticTechnique = [hasPerformance ? 'unjuk kerja' : '', hasProduct ? 'penilaian produk' : ''].filter(Boolean).join(' + ');
  const evidence = getObjectiveEvidenceGroups({ objectives: rpp.learningObjectives, questions: rpp.assessment.summativeQuestions, successCriteria: rpp.successCriteria, productRubric: rpp.productRubric, performanceRubric: rpp.performanceRubric });
  const diagnosticItems = getCompactDiagnostics(rpp, 4);
  const formativeChecklist = getCompactFormativeChecklist(rpp, 4);

  return <section className="space-y-3">
    <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-blue-600 font-bold text-slate-900">D. RENCANA ASESMEN</div>
    <table className="w-full border-collapse text-xs [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-800 [&_th]:text-white [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2">
      <thead><tr><th>Jenis</th><th>Teknik</th><th>Instrumen / Bentuk</th></tr></thead>
      <tbody>
        <tr><td className="font-bold">Diagnostik</td><td>{diagnostic.length ? 'Tanya jawab / kuis awal' : 'Belum dirancang'}</td><td>{diagnostic.length ? `${diagnostic.length} pertanyaan diagnostik` : 'Belum tersedia'}</td></tr>
        <tr><td className="font-bold">Formatif</td><td>{formativeTechniques || 'Belum dirancang'}</td><td>{formativeInstruments || 'Belum tersedia'}</td></tr>
        <tr><td className="font-bold">Sumatif</td><td>{authenticTechnique ? `Tes tertulis + ${authenticTechnique}` : 'Tes tertulis / evaluasi hasil belajar'}</td><td>{pgCount} soal pilihan ganda + {essayCount} soal uraian{productTaskCount ? ` + ${productTaskCount} tugas produk` : hasProduct ? ' + bukti/rubrik produk' : ''}{performanceTaskCount ? ` + ${performanceTaskCount} tugas kinerja` : hasPerformance ? ' + rubrik kinerja' : ''}</td></tr>
      </tbody>
    </table>

    {(diagnosticItems.length || formativeChecklist.length) ? <div className="grid gap-3 sm:grid-cols-2">
      {diagnosticItems.length ? <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
        <p className="mb-1.5 font-bold text-slate-800">Pertanyaan Awal Ringkas</p>
        <ol className="list-decimal space-y-1 pl-4">{diagnosticItems.map((item, index) => <li key={index}>{item.question}{item.keyOrCriteria ? <span className="text-slate-500"> — Kriteria: {item.keyOrCriteria}</span> : null}</li>)}</ol>
      </div> : null}
      {formativeChecklist.length ? <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
        <p className="mb-1.5 font-bold text-slate-800">Catatan Pengamatan Ringkas</p>
        <ul className="space-y-1">{formativeChecklist.map((item, index) => <li key={index}>□ {item}</li>)}</ul>
      </div> : null}
    </div> : null}

    <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-blue-600 font-bold text-slate-900">E. INSTRUMEN SUMATIF & PEMETAAN TP</div>
    <div className="space-y-2">{rpp.assessment.summativeQuestions.map((question, index) => <div key={question.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
      <p className="font-bold">{index + 1}. {question.question}</p>
      {question.options?.length ? <div className="mt-1 space-y-0.5 pl-3 text-slate-700">{formatChoiceOptions(question.options).map((option) => <p key={option}>{option}</p>)}</div> : null}
      <p className="text-blue-900"><b>Kunci:</b> {question.correctAnswer}</p>
      <p><b>Indikator:</b> {question.indicator}</p>
    </div>)}</div>

    <table className="w-full border-collapse text-xs [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-800 [&_th]:text-white [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2">
      <thead><tr><th>TP</th><th>Tujuan</th><th>Soal / Bukti Asesmen</th></tr></thead>
      <tbody>{rpp.learningObjectives.map((objective, index) => {
        const ref = `TP${index + 1}`;
        return <tr key={ref}><td>{ref}</td><td>{objective}</td><td><b>Utama:</b> {(evidence.primary.get(ref) || []).join('; ') || 'Belum terpetakan'}<br/><b>Pendukung:</b> {(evidence.supporting.get(ref) || []).join('; ') || '—'}</td></tr>;
      })}</tbody>
    </table>
  </section>;
}
