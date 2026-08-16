import type {
  AssessmentItemPlan,
  CompetencyGroup,
  PedagogicalObjectivePlan,
  PedagogicalPlan,
  PlannedQuestionType,
} from '../../../../types/pedagogy';
import { competencyGroup } from '../../../../lib/validation/pedagogy';

function writtenCompetency(group: CompetencyGroup, role: 'PRIMARY' | 'SUPPORTING'): CompetencyGroup {
  if (role === 'SUPPORTING' && (group === 'CREATE' || group === 'PERFORMANCE')) return 'ANALYZE';
  return group === 'UNKNOWN' ? 'UNDERSTAND' : group;
}

export function buildAssessmentItemBlueprint(
  objectives: PedagogicalObjectivePlan[],
  blueprint: PedagogicalPlan['assessmentBlueprint'],
  pgCount: number,
  essayCount: number,
): AssessmentItemPlan[] {
  if (!objectives.length) return [];
  const items: AssessmentItemPlan[] = [];

  const addSlots = (questionType: PlannedQuestionType, count: number, prefix: string) => {
    for (let index = 0; index < Math.max(0, count); index += 1) {
      const objective = objectives[index % objectives.length];
      const evidence = blueprint.find((item) => item.objectiveRef === objective.ref);
      const authentic = ['PRODUCT', 'PERFORMANCE', 'OBSERVATION'].includes(evidence?.primaryEvidenceType || '');
      const role = authentic ? 'SUPPORTING' : 'PRIMARY';
      const group = competencyGroup(`${objective.competencyVerb} ${objective.objective}`);
      items.push({
        id: `${prefix}-${index + 1}`,
        questionType,
        objectiveRef: objective.ref,
        role,
        competency: writtenCompetency(group, role),
        contentFocus: objective.contentFocus || objective.objective,
      });
    }
  };

  addSlots('PG', pgCount, 'PG');
  addSlots('Uraian', essayCount, 'UR');
  return items;
}
