export interface SuccessCriterion {
  objective: string;
  criteria: string;
  assessmentEvidence: string;
  primaryEvidence?: string[];
  supportingEvidence?: string[];
}

export interface AssessmentExecutionPlan {
  availableMinutes: number;
  reservedClosingMinutes: number;
  questionBudgetMinutes: number;
  estimatedQuestionMinutes: number;
  selectedQuestionIds: string[];
  fullQuestionBankIds: string[];
  feasible: boolean;
}
