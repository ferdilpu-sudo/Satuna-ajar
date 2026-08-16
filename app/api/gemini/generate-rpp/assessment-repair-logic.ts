import type { MaterialAnalysis, QuizQuestion, SchoolIdentity } from '../../../../types/rpp';
import type { AssessmentItemPlan, PedagogicalPlan } from '../../../../types/pedagogy';
import { validateAssessmentScope } from '../../../../lib/validation';
import { validateQuestionAnswerConsistency } from '../../../../lib/validation/answer-consistency';
import { alignQuestionsToAssessmentPlan } from './assessment-mapping';

export interface AssessmentRepairContext {
  pedagogicalPlan: PedagogicalPlan;
  materialAnalysis: MaterialAnalysis;
  identity: SchoolIdentity;
}

export interface RepairTarget {
  item: AssessmentItemPlan;
  current?: QuizQuestion;
  issues: string[];
}

export function findAssessmentRepairTargets(
  context: AssessmentRepairContext,
  questions: QuizQuestion[],
): RepairTarget[] {
  const objectives = context.pedagogicalPlan.objectives.map((item) => item.objective);
  return context.pedagogicalPlan.assessmentItems.flatMap((item) => {
    const current = questions.find((question) => question.id === item.id);
    if (!current) return [{ item, issues: ['Soal belum tersedia sesuai blueprint asesmen.'] }];
    const result = validateAssessmentScope({
      questions: [current],
      objectives,
      materialAnalysis: context.materialAnalysis,
      topic: context.identity.topic,
      subtopic: context.identity.subtopic,
      pedagogicalPlan: context.pedagogicalPlan,
      checkPlanCompleteness: false,
    });
    const answerIssues = validateQuestionAnswerConsistency(current);
    const issues = [...result.issues, ...answerIssues];
    return issues.length ? [{ item, current, issues }] : [];
  });
}

export function mergeAssessmentReplacements(
  current: QuizQuestion[],
  replacements: QuizQuestion[],
  plan: PedagogicalPlan,
): QuizQuestion[] {
  const replacementById = new Map(replacements.map((question) => [question.id?.trim().toUpperCase(), question]));
  const currentById = new Map(current.map((question) => [question.id?.trim().toUpperCase(), question]));
  const merged = plan.assessmentItems.flatMap((item) => {
    const replacement = replacementById.get(item.id.toUpperCase());
    const existing = currentById.get(item.id.toUpperCase());
    const selected = replacement || existing;
    if (!selected) return [];
    return [{
      ...selected,
      id: item.id,
      type: item.questionType,
      objectiveMeasured: item.objectiveRef,
      evidenceRole: item.role,
      plannedCompetency: item.competency,
    }];
  });
  return alignQuestionsToAssessmentPlan(merged, plan.assessmentItems);
}
