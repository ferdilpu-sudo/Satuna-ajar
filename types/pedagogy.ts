export type AssessmentEvidenceType = 'WRITTEN' | 'PERFORMANCE' | 'PRODUCT' | 'OBSERVATION' | 'MIXED';
export type AssessmentEvidenceRole = 'PRIMARY' | 'SUPPORTING';
export type CompetencyGroup = 'CREATE' | 'PERFORMANCE' | 'EVALUATE' | 'ANALYZE' | 'UNDERSTAND' | 'UNKNOWN';
export type PlannedQuestionType = 'PG' | 'Uraian';

export interface PedagogicalObjectivePlan {
  ref: string;
  objective: string;
  competencyVerb: string;
  contentFocus: string;
  evidenceType: AssessmentEvidenceType;
  criteriaFocus: string;
}

export interface AssessmentItemPlan {
  id: string;
  questionType: PlannedQuestionType;
  objectiveRef: string;
  role: AssessmentEvidenceRole;
  competency: CompetencyGroup;
  contentFocus: string;
}

export interface ScopeFeasibility {
  availableMinutes: number;
  estimatedMinutes: number;
  maxObjectives: number;
  maxAuthenticObjectives: number;
  feasible: boolean;
}

export interface PedagogicalPlan {
  resolvedModel: string;
  modelReason: string;
  objectives: PedagogicalObjectivePlan[];
  assessmentBlueprint: {
    objectiveRef: string;
    primaryEvidenceType: AssessmentEvidenceType;
    writtenAssessmentAllowed: boolean;
    instrumentHint: string;
  }[];
  assessmentItems: AssessmentItemPlan[];
  scopeFeasibility?: ScopeFeasibility;
  activityBlueprint: {
    objectiveRef: string;
    experience: 'MEMAHAMI' | 'MENGAPLIKASI' | 'MEREFLEKSI';
    activityFocus: string;
  }[];
}
