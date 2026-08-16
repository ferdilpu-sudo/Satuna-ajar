import type { MaterialAnalysis, SchoolIdentity } from '../../types/rpp';
import { normalizeGrade, normalizePhase, validateElementLooksLikeTopic, validateElementSubjectAlignment, validateGradeLevelPhase, type ValidationIssue } from './education';
import { validateCPAlignment } from './content';

export interface PreGenerationValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateBeforeGeneration(identity: SchoolIdentity, materialAnalysis?: MaterialAnalysis | null): PreGenerationValidationResult {
  const issues: ValidationIssue[] = [
    ...validateGradeLevelPhase(identity.educationLevel, identity.grade, identity.phase),
  ];

  if (!identity.subject?.trim()) issues.push({ field: 'subject', message: 'Mata pelajaran wajib diisi.', severity: 'error' });
  if (!identity.topic?.trim()) issues.push({ field: 'topic', message: 'Topik/materi wajib diisi.', severity: 'error' });
  if (!identity.learningOutcomes?.trim()) issues.push({ field: 'learningOutcomes', message: 'Capaian Pembelajaran wajib diisi atau dibuat sebagai Draft AI.', severity: 'error' });

  const elementValidation = validateElementSubjectAlignment(identity.subject, identity.element);
  if (!elementValidation.isAligned) {
    issues.push({ field: 'element', message: elementValidation.reason || 'Elemen tidak selaras dengan mata pelajaran.', severity: 'error' });
  }

  const elementTopicValidation = validateElementLooksLikeTopic(identity.element, identity.topic);
  if (elementTopicValidation.looksLikeTopic) {
    issues.push({ field: 'element', message: elementTopicValidation.reason || 'Elemen tampak seperti topik pembelajaran.', severity: 'warning' });
  }

  const cpValidation = validateCPAlignment(identity.learningOutcomes, identity.subject, identity.topic);
  if (!cpValidation.isAligned) {
    issues.push({ field: 'learningOutcomes', message: cpValidation.reason || 'CP tidak selaras dengan materi.', severity: 'error' });
  }

  const detectedGrade = normalizeGrade(materialAnalysis?.detectedGrade || '');
  const formGrade = normalizeGrade(identity.grade);
  if (detectedGrade && formGrade && detectedGrade !== formGrade && !identity.gradeAdaptationNote) {
    issues.push({
      field: 'grade',
      message: `Materi sumber terdeteksi untuk ${detectedGrade}, sedangkan RPP diatur untuk ${formGrade}. Pilih gunakan kelas sumber atau konfirmasi adaptasi terlebih dahulu.`,
      severity: 'error',
    });
  }

  const detectedPhase = normalizePhase(materialAnalysis?.detectedPhase || '');
  if (detectedGrade && detectedPhase && detectedGrade === formGrade && normalizePhase(identity.phase) !== detectedPhase) {
    issues.push({ field: 'phase', message: `Fase sumber terdeteksi Fase ${detectedPhase}, tetapi form menggunakan Fase ${normalizePhase(identity.phase)}.`, severity: 'warning' });
  }

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  return { valid: errors.length === 0, errors, warnings };
}
