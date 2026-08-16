import type { AssessmentExecutionPlan } from '../../types/assessment';
import type { LearningActivityItem, QuizQuestion } from '../../types/rpp';

const QUESTION_COST_MINUTES: Record<QuizQuestion['type'], number> = {
  PG: 2,
  Uraian: 6,
  Kinerja: 8,
  Produk: 10,
};

const SUMMATIVE_PATTERN = /asesmen\s+sumatif|tes\s+sumatif|tes\s+tertulis|evaluasi\s+(?:akhir|sumatif)|mengerjakan\s+tes/i;

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function questionCost(question: QuizQuestion): number {
  return QUESTION_COST_MINUTES[question.type] || 4;
}

function objectiveRef(question: QuizQuestion): string {
  const match = (question.objectiveMeasured || '').toUpperCase().match(/TP\s*(\d+)/);
  return match ? `TP${match[1]}` : 'UNMAPPED';
}

export function detectSummativeWindowMinutes(activities: LearningActivityItem[]): number {
  const closingMatch = activities.find((item) => item.stage === 'PENUTUP' && SUMMATIVE_PATTERN.test(`${item.syntaxOrPrinciple} ${item.description}`));
  if (closingMatch?.timeMinutes) return closingMatch.timeMinutes;
  const anyMatch = activities.find((item) => SUMMATIVE_PATTERN.test(`${item.syntaxOrPrinciple} ${item.description}`));
  if (anyMatch?.timeMinutes) return anyMatch.timeMinutes;
  const closing = [...activities].reverse().find((item) => item.stage === 'PENUTUP');
  if (closing?.timeMinutes) return closing.timeMinutes;
  const total = activities.reduce((sum, item) => sum + (item.timeMinutes || 0), 0);
  return Math.min(20, Math.max(10, Math.round(total * 0.12)));
}

function sortedCandidates(items: QuizQuestion[]): QuizQuestion[] {
  return [...items].sort((a, b) => {
    const roleDelta = (a.evidenceRole === 'PRIMARY' ? 0 : 1) - (b.evidenceRole === 'PRIMARY' ? 0 : 1);
    if (roleDelta) return roleDelta;
    const costDelta = questionCost(a) - questionCost(b);
    if (costDelta) return costDelta;
    return (a.id || '').localeCompare(b.id || '');
  });
}

function pickDistinctObjectiveQuestions(items: QuizQuestion[], type: QuizQuestion['type'], limit: number): QuizQuestion[] {
  const selected: QuizQuestion[] = [];
  const usedRefs = new Set<string>();
  for (const question of sortedCandidates(items.filter((item) => item.type === type))) {
    const ref = objectiveRef(question);
    if (ref !== 'UNMAPPED' && usedRefs.has(ref)) continue;
    selected.push(question);
    if (ref !== 'UNMAPPED') usedRefs.add(ref);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function buildAssessmentExecutionPlan(
  questions: QuizQuestion[],
  activities: LearningActivityItem[],
): AssessmentExecutionPlan {
  const availableMinutes = detectSummativeWindowMinutes(activities);
  const reservedClosingMinutes = Math.min(5, Math.max(3, Math.round(availableMinutes / 3)));
  const questionBudgetMinutes = Math.max(0, availableMinutes - reservedClosingMinutes);
  const bank = questions.filter((item) => Boolean(item.id?.trim()));
  const selected: QuizQuestion[] = [];
  let usedMinutes = 0;

  const addIfFits = (question: QuizQuestion | undefined) => {
    if (!question || selected.some((item) => item.id === question.id)) return false;
    const cost = questionCost(question);
    if (usedMinutes + cost > questionBudgetMinutes) return false;
    selected.push(question);
    usedMinutes += cost;
    return true;
  };

  // Dalam penutup singkat, utamakan dua PG lintas-TP lalu satu uraian.
  // Ini lebih realistis daripada memaksakan satu soal dari setiap TP sekaligus.
  pickDistinctObjectiveQuestions(bank, 'PG', 2).forEach(addIfFits);

  const essays = sortedCandidates(bank.filter((question) => question.type === 'Uraian'));
  const uncoveredEssay = essays.find((question) => !selected.some((item) => objectiveRef(item) === objectiveRef(question)));
  addIfFits(uncoveredEssay || essays[0]);

  // Jika masih ada waktu, isi dengan soal termurah yang paling relevan.
  sortedCandidates(bank).forEach(addIfFits);

  const selectedQuestionIds = selected.map((item) => item.id);
  return {
    availableMinutes,
    reservedClosingMinutes,
    questionBudgetMinutes,
    estimatedQuestionMinutes: usedMinutes,
    selectedQuestionIds,
    fullQuestionBankIds: bank.map((item) => item.id),
    feasible: selectedQuestionIds.length > 0 && usedMinutes <= questionBudgetMinutes,
  };
}
