import type { AssessmentExecutionPlan } from '../../../../types/assessment';
import type { LearningActivityItem } from '../../../../types/rpp';

const DIAGNOSTIC_PATTERN = /asesmen\s+diagnostik|diagnostik\s+awal|tes\s+diagnostik/i;
const SUMMATIVE_PATTERN = /asesmen\s+sumatif|tes\s+sumatif|tes\s+tertulis|evaluasi\s+(?:akhir|sumatif)|mengerjakan\s+tes/i;
const GENERATED_DIAGNOSTIC = /\s*Guru (?:memberikan asesmen diagnostik awal berupa|mengawali pembelajaran dengan) \d+ pertanyaan singkat[^.]*\./i;
const GENERATED_EXECUTION = /\s*Pada pertemuan ini, (?:asesmen sumatif tertulis menggunakan|peserta didik mengerjakan) .*?(?:bank instrumen|pertemuan berikutnya)\. (?:Sisa|Sekitar) \d+ menit .*?penutupan\./i;

function appendSentence(value: string, sentence: string): string {
  const base = (value || '').trim();
  if (!base) return sentence;
  return `${base}${/[.!?]$/.test(base) ? '' : '.'} ${sentence}`;
}

function normalizeExistingDiagnostic(value: string, diagnosticCount: number): string {
  if (!DIAGNOSTIC_PATTERN.test(value)) return value;
  const alreadyCounted = new RegExp(`\\b${diagnosticCount}\\s+pertanyaan`, 'i').test(value);
  if (alreadyCounted) return value;
  return value
    .replace(
      /(?:asesmen|tes)\s+diagnostik(?:\s+kognitif|\s+awal)?(?:\s+singkat)?/i,
      `${diagnosticCount} pertanyaan diagnostik singkat`,
    )
    .replace(/\bvia\b/gi, 'melalui');
}

function normalizeGenericSummativePhrase(value: string): string {
  return value
    .replace(/peserta didik\s+mengerjakan\s+(?:tes|asesmen)\s+sumatif(?:\s*\([^)]*\))?(?:\s+secara\s+individu)?/gi, 'Peserta didik mengerjakan asesmen sumatif tertulis terpilih')
    .replace(/peserta didik\s+mengerjakan\s+tes\s+evaluasi\s+sumatif(?:\s*\([^)]*\))?/gi, 'Peserta didik mengerjakan asesmen sumatif tertulis terpilih');
}

export function syncModuleAssessmentActivities(
  activities: LearningActivityItem[],
  diagnosticCount: number,
  executionPlan?: AssessmentExecutionPlan,
): LearningActivityItem[] {
  if (!activities.length) return activities;
  const firstOpeningIndex = activities.findIndex((item) => item.stage === 'PENDAHULUAN');
  const summativeIndex = activities.findIndex((item) => item.stage === 'PENUTUP' && SUMMATIVE_PATTERN.test(`${item.syntaxOrPrinciple} ${item.description}`));
  const fallbackClosingIndex = activities.map((item) => item.stage).lastIndexOf('PENUTUP');

  return activities.map((item, index) => {
    let description = (item.description || '').replace(GENERATED_DIAGNOSTIC, '').replace(GENERATED_EXECUTION, '').trim();
    if (index === firstOpeningIndex && diagnosticCount > 0) {
      description = normalizeExistingDiagnostic(description, diagnosticCount);
      const hasCountedDiagnostic = new RegExp(`\\b${diagnosticCount}\\s+pertanyaan\\s+diagnostik\\b`, 'i').test(description);
      if (!DIAGNOSTIC_PATTERN.test(description) && !hasCountedDiagnostic) {
        description = appendSentence(description, `Guru memberikan ${diagnosticCount} pertanyaan diagnostik singkat untuk melihat pemahaman awal peserta didik.`);
      }
    }

    const targetClosingIndex = summativeIndex >= 0 ? summativeIndex : fallbackClosingIndex;
    if (index === targetClosingIndex && executionPlan?.selectedQuestionIds.length) {
      description = normalizeGenericSummativePhrase(description);
      description = appendSentence(
        description,
        `Peserta didik mengerjakan evaluasi singkat yang telah dipilih selama sekitar ${executionPlan.estimatedQuestionMinutes} menit. Soal lainnya dapat digunakan untuk latihan atau pertemuan berikutnya. Sekitar ${executionPlan.reservedClosingMinutes} menit digunakan untuk refleksi dan penutupan.`,
      );
    }
    return description === item.description ? item : { ...item, description };
  });
}
