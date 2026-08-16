export type { ValidationIssue } from './validation/education';
export {
  expectedPhaseForGrade,
  formatPhase,
  getSuggestedElementsForSubject,
  normalizeEducationLevel,
  normalizeGrade,
  normalizePhase,
  parseGradeNumber,
  SUBJECT_ELEMENT_MAP,
  validateElementLooksLikeTopic,
  validateElementSubjectAlignment,
  validateGradeLevelPhase,
} from './validation/education';
export {
  allObjectivesHaveAssessment,
  getAssessedObjectiveRefs,
  hasProductActivity,
  isGraduateProfileRubricComplete,
  objectiveReference,
  validateCPAlignment,
  validateModelSyntax,
} from './validation/content';
export { validateBeforeGeneration } from './validation/pre-generation';
export type { PreGenerationValidationResult } from './validation/pre-generation';
export { buildSourceFactCorpus, extractFactAnchors, findUnsupportedFactAnchors } from './validation/source-grounding';

export { allObjectivesHaveAssessmentEvidence, getObjectiveEvidenceGroups, getObjectiveEvidenceMap, normalizeObjectiveRef, validateAssessmentScope } from './validation/assessment';
export { competencyGroup, inferEvidenceTypeFromObjective, isQuestionCompetencyCompatible, isQuestionCompatibleWithCompetency, validateObjectiveAlignment, validatePedagogicalPlan, validateWorksheetAlignment } from './validation/pedagogy';
