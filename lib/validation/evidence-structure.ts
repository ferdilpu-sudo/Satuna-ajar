import type { SuccessCriterion } from '../../types/assessment';
import type { AssessmentEvidenceType } from '../../types/pedagogy';

const QUESTION_REF_PATTERN = /\b(?:PG|UR|PR|KN)-\d+\b/gi;
const AUTHENTIC_TYPES = new Set<AssessmentEvidenceType>(['PRODUCT', 'PERFORMANCE', 'OBSERVATION', 'MIXED']);

function unique(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function cleanPrimaryEvidenceText(value: string): string {
  return (value || '')
    .replace(/\s*(?:dan|serta)?\s*(?:jawaban\s+)?tes\s+pendukung\s*\([^)]*\)/gi, '')
    .replace(/\s*(?:dan|serta)?\s*(?:jawaban\s+)?tes\s+tertulis\s*\([^)]*\)/gi, '')
    .replace(/\s*(?:dan|serta)?\s*soal\s+pendukung\s*\([^)]*\)/gi, '')
    .replace(/\s*(?:dan|serta)?\s*tes\s+pendukung\s*:?\s*(?:PG|UR)-\d+(?:\s*[,;]\s*(?:PG|UR)-\d+)*/gi, '')
    .replace(/[.;,\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function structureSuccessCriterionEvidence(
  criterion: SuccessCriterion,
  evidenceType: AssessmentEvidenceType,
): SuccessCriterion {
  const source = criterion.assessmentEvidence || '';
  const refs = unique(source.match(QUESTION_REF_PATTERN) || []);
  const primaryText = cleanPrimaryEvidenceText(source);
  const authenticPrimary = AUTHENTIC_TYPES.has(evidenceType);
  const existingPrimary = criterion.primaryEvidence || [];
  const existingSupporting = criterion.supportingEvidence || [];

  const primaryEvidence = unique([
    ...existingPrimary,
    ...(primaryText ? [primaryText] : []),
    ...(!authenticPrimary ? refs : []),
  ]);
  const supportingEvidence = unique([
    ...existingSupporting,
    ...(authenticPrimary ? refs : []),
  ]);

  return { ...criterion, primaryEvidence, supportingEvidence };
}
