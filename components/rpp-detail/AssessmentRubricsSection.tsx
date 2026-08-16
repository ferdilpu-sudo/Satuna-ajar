import type { RPPData, RubricItem } from '../../types/rpp';
import { getObjectiveEvidenceGroups } from '../../lib/validation/assessment';
import { assessmentExecutionSummary } from '../../lib/assessment-execution-display';
import { formatChoiceOptions } from '../../lib/assessment-display';

export default function AssessmentRubricsSection({ rpp }: { rpp: RPPData }) {
  const evidence = getObjectiveEvidenceGroups({
    objectives: rpp.learningObjectives,
    questions: rpp.assessment.summativeQuestions,
    successCriteria: rpp.successCriteria,
    productRubric: rpp.productRubric,
    performanceRubric: rpp.performanceRubric,
  });

  const diagnostic = [...(rpp.assessment?.diagnosticNonCognitive || []), ...(rpp.assessment?.diagnosticCognitive || [])];
  const formative = rpp.assessment?.formative || [];
  const executionSummary = assessmentExecutionSummary(rpp.assessment.executionPlan);

  return (
    <div className="space-y-6">
      {/* H. RENCANA ASESMEN */}
      <section id="rpp-asesmen-plan" className="scroll-mt-24 space-y-3">
        <SectionTitle>H. RENCANA ASESMEN</SectionTitle>
        {diagnostic.length > 0 && (
          <div>
            <p className="font-bold text-slate-900 mb-1">1. Asesmen Diagnostik (Awal Pembelajaran)</p>
            <ul className="list-disc pl-5 space-y-1">
              {diagnostic.map((d, i) => (
                <li key={i}>
                  <b>{d.category}:</b> {d.question} {d.keyOrCriteria ? <span className="text-slate-600">(Kriteria: {d.keyOrCriteria})</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {formative.length > 0 && (
          <div>
            <p className="font-bold text-slate-900 mb-1">2. Asesmen Formatif (Proses Pembelajaran)</p>
            <ul className="list-disc pl-5 space-y-1">
              {formative.map((f, i) => (
                <li key={i}>
                  <b>{f.technique}:</b> {f.instrument} ({f.timing}) — <span className="text-slate-600">{f.purpose}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {executionSummary ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
            <p className="font-bold text-blue-950">3. Soal yang Dikerjakan pada Pertemuan Ini</p>
            <p className="mt-1 text-blue-900">{executionSummary}</p>
            <p className="mt-1 text-blue-800">Dari {rpp.assessment.executionPlan?.availableMinutes} menit waktu penutup, sekitar {rpp.assessment.executionPlan?.reservedClosingMinutes} menit digunakan untuk refleksi dan penutupan.</p>
          </div>
        ) : null}
      </section>

      {/* I. RUBRIK PENILAIAN */}
      <section id="rpp-rubrik" className="scroll-mt-24 space-y-3">
        <SectionTitle>I. RUBRIK PENILAIAN</SectionTitle>
        <Rubric title="1. Rubrik Kinerja / Keterampilan" items={rpp.performanceRubric} />
        <Rubric title="2. Rubrik Dimensi Profil Lulusan" items={rpp.graduateProfileRubric} />
        <Rubric title="3. Rubrik Produk / Karya" items={rpp.productRubric || []} />
        {rpp.productRubric?.length ? <p className="text-xs italic text-slate-600">* Rumus Nilai Produk = (Skor Perolehan / Skor Maksimal) × 100</p> : null}
      </section>

      {/* J. REFLEKSI PESERTA DIDIK & GURU */}
      <section id="rpp-refleksi" className="scroll-mt-24 space-y-3">
        <SectionTitle>J. REFLEKSI PESERTA DIDIK & GURU</SectionTitle>
        <div>
          <p className="font-bold text-slate-900 mb-1">Refleksi Peserta Didik:</p>
          <ul className="list-disc pl-5 space-y-1">
            {rpp.studentReflectionQuestions.map((q, idx) => <li key={idx}>{q}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-bold text-slate-900 mb-1">Refleksi Guru:</p>
          <ul className="list-disc pl-5 space-y-1">
            {rpp.teacherReflectionQuestions.map((q, idx) => <li key={idx}>{q}</li>)}
          </ul>
        </div>
      </section>

      {/* K. REMEDIAL & PENGAYAAN */}
      <section id="rpp-remedial" className="scroll-mt-24 space-y-2">
        <SectionTitle>K. PROGRAM REMEDIAL & PENGAYAAN</SectionTitle>
        <p><b>Program Remedial:</b> {rpp.remedialActivities?.length ? rpp.remedialActivities.join('; ') : 'Bimbingan perorangan atau tutor sebaya untuk indikator/TP yang belum tuntas.'}</p>
        <p><b>Program Pengayaan:</b> {rpp.enrichmentActivities?.length ? rpp.enrichmentActivities.join('; ') : 'Pemberian soal-soal tingkat tinggi (HOTS) atau pendalaman materi secara mandiri.'}</p>
      </section>

      {/* M. SOAL SUMATIF, KUNCI JAWABAN & PEMETAAN TP */}
      <section id="rpp-soal" className="scroll-mt-24 space-y-3">
        <SectionTitle>M. SOAL SUMATIF, KUNCI JAWABAN & PEMETAAN TP</SectionTitle>
        <p className="font-bold text-slate-900">1. Daftar Soal & Kunci Jawaban:</p>
        <div className="space-y-2">
          {rpp.assessment.summativeQuestions.map((q, index) => (
            <div key={q.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="font-bold text-slate-900">
                {index + 1}. {q.question}
              </p>
              {q.options?.length ? <div className="space-y-0.5 pl-3 text-slate-700">{formatChoiceOptions(q.options).map((option) => <p key={option}>{option}</p>)}</div> : null}
              <p className="text-blue-900 font-semibold"><b>Kunci / Kriteria Jawaban:</b> {q.correctAnswer}</p>
              <p className="text-slate-600"><b>Indikator:</b> {q.indicator}</p>
            </div>
          ))}
        </div>

        {rpp.teacherAnswerGuide?.expectedAnswers?.length ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs space-y-1">
            <p className="font-bold text-blue-950">Panduan Jawaban Guru (LKPD):</p>
            <ul className="list-disc pl-5 space-y-0.5 text-blue-900">
              {rpp.teacherAnswerGuide.expectedAnswers.map((ans, idx) => (
                <li key={idx}><b>Diharapkan:</b> {ans}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="font-bold text-slate-900 mt-3">2. Tabel Pemetaan Asesmen ke TP:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-800 [&_th]:text-white [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2">
            <thead>
              <tr>
                <th className="w-[15%]">TP</th>
                <th className="w-[50%]">Tujuan Pembelajaran</th>
                <th className="w-[35%]">Soal / Bukti Asesmen</th>
              </tr>
            </thead>
            <tbody>
              {rpp.learningObjectives.map((objective, index) => {
                const ref = `TP${index + 1}`;
                return (
                  <tr key={ref}>
                    <td className="font-bold">{ref}</td>
                    <td>{objective}</td>
                    <td><b>Utama:</b> {(evidence.primary.get(ref) || []).join('; ') || 'Belum terpetakan'}<br/><b>Pendukung:</b> {(evidence.supporting.get(ref) || []).join('; ') || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Rubric({ title, items }: { title: string; items: RubricItem[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="font-bold text-slate-900">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-800 [&_th]:text-white [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2">
          <thead>
            <tr>
              <th className="w-[25%]">Aspek & Indikator</th>
              <th className="w-[18%]">Skor 1 (Belum)</th>
              <th className="w-[18%]">Skor 2 (Mulai)</th>
              <th className="w-[18%]">Skor 3 (Konsisten)</th>
              <th className="w-[21%]">Skor 4 (Mandiri)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={`${r.aspect}-${i}`}>
                <td>
                  <b>{r.aspect}</b>
                  <br />
                  <span className="text-slate-600">{r.indicator}</span>
                </td>
                <td>{r.levels.score1}</td>
                <td>{r.levels.score2}</td>
                <td>{r.levels.score3}</td>
                <td>{r.levels.score4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="border-l-4 border-blue-600 bg-slate-100 px-3 py-1.5 font-bold text-slate-900">{children}</div>;
}
