import type { AssessmentExecutionPlan } from '../types/assessment';

function joinQuestionIds(ids: string[]): string {
  if (ids.length <= 1) return ids[0] || '';
  if (ids.length === 2) return `${ids[0]} dan ${ids[1]}`;
  return `${ids.slice(0, -1).join(', ')}, dan ${ids[ids.length - 1]}`;
}

export function assessmentExecutionSummary(plan?: AssessmentExecutionPlan): string {
  if (!plan?.selectedQuestionIds?.length) return '';
  const remaining = Math.max(0, plan.fullQuestionBankIds.length - plan.selectedQuestionIds.length);
  const remainingNote = remaining > 0
    ? ` ${remaining} soal lainnya dapat digunakan untuk latihan atau pertemuan berikutnya.`
    : '';
  return `Pada pertemuan ini, gunakan ${joinQuestionIds(plan.selectedQuestionIds)} (sekitar ${plan.estimatedQuestionMinutes} menit).${remainingNote}`;
}
