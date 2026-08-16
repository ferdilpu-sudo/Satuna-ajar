import type { PedagogicalObjectivePlan, ScopeFeasibility } from '../../types/pedagogy';

const AUTHENTIC = new Set(['PRODUCT', 'PERFORMANCE', 'OBSERVATION', 'MIXED']);
const MULTI_COMPETENCY = /\b(menganalisis|mengonstruksi|mengkonstruksi|memprediksi|merancang|merumuskan|melakukan|menyelidiki|mengevaluasi|membuat|menyusun)\b/gi;

export function moduleObjectiveLimit(totalMinutes: number): number {
  if (totalMinutes <= 150) return 3;
  if (totalMinutes <= 210) return 4;
  return 5;
}

export function moduleAuthenticObjectiveLimit(totalMinutes: number): number {
  if (totalMinutes <= 150) return 2;
  if (totalMinutes <= 210) return 3;
  return 4;
}

function objectiveMinutes(item: PedagogicalObjectivePlan): number {
  const base = item.evidenceType === 'PRODUCT' ? 40
    : item.evidenceType === 'PERFORMANCE' ? 35
      : item.evidenceType === 'OBSERVATION' ? 30
        : item.evidenceType === 'MIXED' ? 45 : 25;
  const competencyCount = new Set((item.objective.match(MULTI_COMPETENCY) || []).map((value) => value.toLowerCase())).size;
  return base + (competencyCount > 1 ? 10 : 0);
}

export function assessModuleScope(objectives: PedagogicalObjectivePlan[], totalMinutes: number): ScopeFeasibility {
  const maxObjectives = moduleObjectiveLimit(totalMinutes);
  const maxAuthenticObjectives = moduleAuthenticObjectiveLimit(totalMinutes);
  const authenticObjectives = objectives.filter((item) => AUTHENTIC.has(item.evidenceType)).length;
  const estimatedMinutes = 20 + objectives.reduce((sum, item) => sum + objectiveMinutes(item), 0);
  const feasible = objectives.length <= maxObjectives
    && authenticObjectives <= maxAuthenticObjectives
    && estimatedMinutes <= totalMinutes + 10;
  return { availableMinutes: totalMinutes, estimatedMinutes, maxObjectives, maxAuthenticObjectives, feasible };
}
