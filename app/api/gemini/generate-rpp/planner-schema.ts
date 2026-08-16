import { Type } from '@google/genai';
import { bool, object, objectArray, str } from './schema-common';

const evidenceType = {
  type: Type.STRING,
  description: 'WRITTEN | PERFORMANCE | PRODUCT | OBSERVATION | MIXED',
} as const;

const objectivePlan = object({
  ref: str,
  objective: str,
  competencyVerb: str,
  contentFocus: str,
  evidenceType,
  criteriaFocus: str,
}, ['ref', 'objective', 'competencyVerb', 'contentFocus', 'evidenceType', 'criteriaFocus']);

export const PEDAGOGICAL_PLAN_SCHEMA = object({
  resolvedModel: str,
  modelReason: str,
  objectives: objectArray(objectivePlan),
  assessmentBlueprint: objectArray(object({
    objectiveRef: str,
    primaryEvidenceType: evidenceType,
    writtenAssessmentAllowed: bool,
    instrumentHint: str,
  }, ['objectiveRef', 'primaryEvidenceType', 'writtenAssessmentAllowed', 'instrumentHint'])),
  activityBlueprint: objectArray(object({
    objectiveRef: str,
    experience: str,
    activityFocus: str,
  }, ['objectiveRef', 'experience', 'activityFocus'])),
}, ['resolvedModel', 'modelReason', 'objectives', 'assessmentBlueprint', 'activityBlueprint']);
