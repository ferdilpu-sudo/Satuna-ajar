import type { MaterialAnalysis, QuizQuestion, RubricItem } from '../../types/rpp';
import type { PedagogicalPlan } from '../../types/pedagogy';
import { inferEvidenceTypeFromObjective, isQuestionCompetencyCompatible, isQuestionCompatibleWithCompetency } from './pedagogy';
import { isQuestionContentAligned } from './question-semantics';

interface SuccessCriterionLike {
  objective: string;
  criteria: string;
  assessmentEvidence: string;
  primaryEvidence?: string[];
  supportingEvidence?: string[];
}

interface ObjectiveEvidenceInput {
  objectives: string[];
  questions: QuizQuestion[];
  successCriteria?: SuccessCriterionLike[];
  productRubric?: RubricItem[];
  performanceRubric?: RubricItem[];
}

interface AssessmentScopeInput {
  questions: QuizQuestion[];
  objectives: string[];
  materialAnalysis?: MaterialAnalysis;
  topic?: string;
  subtopic?: string;
  pedagogicalPlan?: PedagogicalPlan;
  checkPlanCompleteness?: boolean;
}

const STOP_WORDS = new Set([
  'peserta', 'didik', 'mampu', 'dengan', 'yang', 'untuk', 'dalam', 'secara', 'serta', 'dan', 'atau',
  'pada', 'dari', 'melalui', 'menjelaskan', 'menganalisis', 'mengidentifikasi', 'memahami', 'menentukan',
]);

const PRODUCT_PATTERN = /produk|kartu|poster|infografis|video|laporan|prototipe|karya|media|model|portofolio|proposal|rancangan\s+(?:aksi|solusi|produk|proyek)|usulan\s+(?:aksi|solusi)/i;
const INVESTIGATION_PATTERN = /penyelidikan|investigasi|eksperimen|percobaan|praktikum|riset lapangan/i;
const PERFORMANCE_PATTERN = /unjuk kerja|kinerja|praktik|mendemonstrasikan|mempraktikkan|menyajikan|presentasi|melakukan|membuat|simulasi|penyelidikan|investigasi|eksperimen|percobaan|praktikum/i;
const OBSERVATION_PATTERN = /observasi|pengamatan|investigasi lapangan|penyelidikan lapangan|catatan lapangan|lembar observasi/i;

function normalizeEvidenceText(value: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi, ' ').replace(/\s+/g, ' ').trim();
}

function evidenceConcepts(value: string): Set<string> {
  const normalized = normalizeEvidenceText(value);
  const concepts = new Set<string>();
  if (PRODUCT_PATTERN.test(normalized)) concepts.add('product');
  if (/rubrik/.test(normalized) && /produk/.test(normalized)) concepts.add('product-rubric');
  if (PERFORMANCE_PATTERN.test(normalized) || INVESTIGATION_PATTERN.test(normalized)) concepts.add('performance');
  if (OBSERVATION_PATTERN.test(normalized)) concepts.add('observation');
  if (/rubrik/.test(normalized) && /kinerja|unjuk kerja|praktik|demonstrasi|presentasi|penyelidikan|investigasi|eksperimen/.test(normalized)) concepts.add('performance-rubric');
  return concepts;
}

function evidenceMatchesType(value: string, type: ReturnType<typeof inferEvidenceTypeFromObjective>): boolean {
  const concepts = evidenceConcepts(value);
  if (type === 'PRODUCT') return concepts.has('product');
  if (type === 'PERFORMANCE') return concepts.has('performance') || (concepts.has('observation') && INVESTIGATION_PATTERN.test(value));
  if (type === 'OBSERVATION') return concepts.has('observation');
  return true;
}

function dedupeSemanticEvidence(items: string[]): string[] {
  const result: string[] = [];
  for (const item of items) {
    const normalized = normalizeEvidenceText(item);
    if (!normalized) continue;
    const concepts = evidenceConcepts(item);
    const duplicate = result.some((existing) => {
      const existingNormalized = normalizeEvidenceText(existing);
      if (existingNormalized === normalized) return true;
      const existingConcepts = evidenceConcepts(existing);
      const sameConcept = concepts.size > 0 && [...concepts].every((concept) => existingConcepts.has(concept));
      const reverseConcept = existingConcepts.size > 0 && [...existingConcepts].every((concept) => concepts.has(concept));
      const contains = existingNormalized.includes(normalized) || normalized.includes(existingNormalized);
      return (sameConcept || reverseConcept) && contains;
    });
    if (!duplicate) result.push(item);
  }
  return result;
}

export function normalizeObjectiveRef(value: string, objectives: string[]): string | undefined {
  const direct = (value || '').toUpperCase().match(/TP\s*([1-9]\d*)/);
  if (direct) {
    const index = Number(direct[1]) - 1;
    return index >= 0 && index < objectives.length ? `TP${index + 1}` : undefined;
  }
  const normalized = (value || '').trim().toLowerCase();
  const index = objectives.findIndex((objective) => objective.trim().toLowerCase() === normalized);
  return index >= 0 ? `TP${index + 1}` : undefined;
}

export function getObjectiveEvidenceGroups(input: ObjectiveEvidenceInput): { primary: Map<string, string[]>; supporting: Map<string, string[]> } {
  const primary = new Map<string, string[]>();
  const supporting = new Map<string, string[]>();
  input.objectives.forEach((_, index) => {
    primary.set(`TP${index + 1}`, []);
    supporting.set(`TP${index + 1}`, []);
  });

  input.questions.forEach((question, index) => {
    const ref = normalizeObjectiveRef(question.objectiveMeasured, input.objectives);
    if (!ref) return;
    const objectiveIndex = Number(ref.slice(2)) - 1;
    const objective = input.objectives[objectiveIndex] || '';
    const label = question.id?.trim() || `Soal ${index + 1}`;

    if (question.evidenceRole === 'SUPPORTING') {
      const target = question.plannedCompetency || 'UNDERSTAND';
      if (isQuestionCompatibleWithCompetency(question, target)) supporting.get(ref)?.push(label);
      return;
    }
    if (isQuestionCompetencyCompatible(question, objective) && isQuestionContentAligned(question, objective, 'PRIMARY')) primary.get(ref)?.push(label);
  });

  (input.successCriteria || []).forEach((item, index) => {
    const ref = normalizeObjectiveRef(item.objective, input.objectives) || `TP${index + 1}`;
    if (!primary.has(ref)) return;
    const objectiveIndex = Number(ref.slice(2)) - 1;
    const evidenceType = inferEvidenceTypeFromObjective(input.objectives[objectiveIndex] || '');
    const structuredPrimary = (item.primaryEvidence || []).filter((value) => value?.trim());
    const structuredSupporting = (item.supportingEvidence || []).filter((value) => value?.trim());

    if (structuredPrimary.length || structuredSupporting.length) {
      structuredPrimary.forEach((evidence) => {
        if (evidenceMatchesType(evidence, evidenceType) || evidenceType === 'WRITTEN') primary.get(ref)?.push(evidence);
      });
      structuredSupporting.forEach((evidence) => supporting.get(ref)?.push(evidence));
      return;
    }

    const evidence = item.assessmentEvidence?.trim();
    if (!evidence || /belum (dirancang|tersedia|terpetakan)/i.test(evidence)) return;
    if (!evidenceMatchesType(evidence, evidenceType)) return;
    primary.get(ref)?.push(evidence);
  });

  input.objectives.forEach((objective, index) => {
    const ref = `TP${index + 1}`;
    const current = primary.get(ref) || [];
    const hasProductRubricEvidence = current.some((item) => evidenceConcepts(item).has('product-rubric'));
    const hasPerformanceRubricEvidence = current.some((item) => evidenceConcepts(item).has('performance-rubric'));
    if (PRODUCT_PATTERN.test(objective) && input.productRubric?.length && current.length === 0 && !hasProductRubricEvidence) current.push('Produk + Rubrik Produk');
    if (PERFORMANCE_PATTERN.test(objective) && input.performanceRubric?.length && current.length === 0 && !hasPerformanceRubricEvidence) current.push('Unjuk Kerja + Rubrik Kinerja');
  });

  primary.forEach((items, ref) => primary.set(ref, dedupeSemanticEvidence(items)));
  supporting.forEach((items, ref) => supporting.set(ref, dedupeSemanticEvidence(items)));
  return { primary, supporting };
}

export function getObjectiveEvidenceMap(input: ObjectiveEvidenceInput): Map<string, string[]> {
  return getObjectiveEvidenceGroups(input).primary;
}

export function allObjectivesHaveAssessmentEvidence(input: ObjectiveEvidenceInput): boolean {
  if (!input.objectives.length) return false;
  const evidence = getObjectiveEvidenceMap(input);
  return input.objectives.every((_, index) => (evidence.get(`TP${index + 1}`)?.length || 0) > 0);
}

function significantWords(text: string): Set<string> {
  return new Set((text || '').toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word)));
}

function extractLearningRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const pattern = /\b(?:angka|bilangan|membilang|jumlah)[^.!?\n]{0,50}?(\d+)\s*(?:sampai(?:\s+dengan)?|hingga|[-–])\s*(\d+)/gi;
  for (const match of text.matchAll(pattern)) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && start <= end && end <= 1000) ranges.push([start, end]);
  }
  return ranges;
}

function questionNumbers(text: string): number[] {
  return [...text.matchAll(/\b\d+\b/g)].map((match) => Number(match[0])).filter(Number.isFinite);
}

export function validateAssessmentScope(input: AssessmentScopeInput): { isAligned: boolean; issues: string[] } {
  const issues: string[] = [];
  const materialText = [
    input.topic || '', input.subtopic || '', input.materialAnalysis?.title || '',
    ...(input.materialAnalysis?.coreConcepts || []), ...(input.materialAnalysis?.keyTerms || []),
    input.materialAnalysis?.rawTextContext || '', ...input.objectives,
  ].join(' ');
  const ranges = extractLearningRanges(materialText);
  if (input.pedagogicalPlan?.assessmentItems?.length && input.checkPlanCompleteness !== false) {
    const presentIds = new Set(input.questions.map((question) => question.id?.trim().toUpperCase()));
    const missingIds = input.pedagogicalPlan.assessmentItems
      .map((item) => item.id)
      .filter((id) => !presentIds.has(id.toUpperCase()));
    if (missingIds.length) issues.push(`Blueprint asesmen belum lengkap. Item yang belum tersedia: ${missingIds.join(', ')}.`);
  }

  input.questions.forEach((question, index) => {
    const ref = normalizeObjectiveRef(question.objectiveMeasured, input.objectives);
    if (!ref) {
      issues.push(`Soal ${index + 1} belum memiliki pemetaan TP yang valid.`);
      return;
    }

    const objective = input.objectives[Number(ref.slice(2)) - 1] || '';
    const plannedItem = input.pedagogicalPlan?.assessmentItems?.find((item) => item.id === question.id);
    const competencyCompatible = plannedItem
      ? isQuestionCompatibleWithCompetency(question, plannedItem.competency)
      : isQuestionCompetencyCompatible(question, objective);
    if (!competencyCompatible) {
      const competencyLabel = plannedItem?.role === 'SUPPORTING'
        ? 'kompetensi pendukung yang direncanakan'
        : 'level kompetensi utama TP yang dipetakan';
      issues.push(`Soal ${index + 1} (${ref}) tidak mengukur ${competencyLabel}.`);
    }
    if (question.type === 'PG' && (!question.options || question.options.length < 4)) {
      issues.push(`Soal ${index + 1} (${ref}) belum memiliki minimal 4 opsi jawaban.`);
    }
    if (plannedItem && plannedItem.objectiveRef !== ref) {
      issues.push(`Soal ${index + 1} harus dipetakan ke ${plannedItem.objectiveRef} sesuai blueprint asesmen.`);
    }
    const contentRole = plannedItem?.role || question.evidenceRole || 'PRIMARY';
    if (contentRole === 'PRIMARY') {
      const contentFocus = plannedItem?.contentFocus || objective;
      if (!isQuestionContentAligned(question, contentFocus, 'PRIMARY')) {
        issues.push(`Soal ${index + 1} (${ref}) bergeser dari fokus konten TP yang direncanakan.`);
      }
    }

    if (ranges.length) {
      const numbers = questionNumbers(question.question);
      const outside = numbers.filter((value) => !ranges.some(([start, end]) => value >= start && value <= end));
      if (outside.length) {
        issues.push(`Soal ${index + 1} memuat angka di luar rentang materi/TP yang terdeteksi: ${[...new Set(outside)].join(', ')}.`);
      }
    }
  });

  return { isAligned: issues.length === 0, issues };
}
