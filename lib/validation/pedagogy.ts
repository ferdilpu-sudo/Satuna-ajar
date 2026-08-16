import type { LKPDSection, MaterialAnalysis, QuizQuestion } from '../../types/rpp';
import type { AssessmentEvidenceType, CompetencyGroup, PedagogicalPlan } from '../../types/pedagogy';
import { inferQuestionCognitiveDemand } from './question-semantics';

const STOP_WORDS = new Set([
  'peserta', 'didik', 'mampu', 'dengan', 'yang', 'untuk', 'dalam', 'secara', 'serta', 'dan', 'atau', 'pada',
  'dari', 'melalui', 'berdasarkan', 'tentang', 'sebagai', 'suatu', 'sebuah', 'terhadap', 'hasil', 'kontekstual',
]);

const CREATE = /\b(merancang|membuat|menghasilkan|menyusun|mengembangkan|mencipta|merumuskan|mengonstruksi|mengkonstruksi)\b/i;
const OBSERVATION = /(?:melalui|berdasarkan)\s+(?:(?:hasil|data)\s+)?(?:observasi|pengamatan|investigasi|penyelidikan)(?:\s+lapangan)?|(?:hasil|data)\s+(?:observasi|pengamatan|investigasi|penyelidikan)(?:\s+lapangan)?|observasi\s+lapangan|pengamatan\s+lapangan|investigasi\s+lapangan|penyelidikan\s+lapangan/i;
const PERFORMANCE = /\b(mendemonstrasikan|mempraktikkan|melakukan|menyajikan|mempresentasikan|mengoperasikan|menyelidiki|bereksperimen|simulasi|penyelidikan|investigasi|eksperimen|percobaan|praktikum)\b/i;
const EVALUATE = /\b(mengevaluasi|menilai|mengkritisi|mempertimbangkan|memutuskan)\b/i;
const ANALYZE = /\b(menganalisis|membandingkan|mengklasifikasikan|menghubungkan|menguraikan|membedakan|memprediksi|menghitung)\b/i;
const UNDERSTAND = /\b(menjelaskan|mengidentifikasi|menentukan|menyebutkan|mendeskripsikan|memahami|mengenali)\b/i;

const COMPETENCY_RANK: Record<CompetencyGroup, number> = {
  UNKNOWN: 0,
  UNDERSTAND: 1,
  ANALYZE: 2,
  EVALUATE: 3,
  CREATE: 4,
  PERFORMANCE: 4,
};

export function competencyGroup(text: string): CompetencyGroup {
  if (CREATE.test(text)) return 'CREATE';
  if (PERFORMANCE.test(text)) return 'PERFORMANCE';
  if (EVALUATE.test(text)) return 'EVALUATE';
  if (ANALYZE.test(text)) return 'ANALYZE';
  if (UNDERSTAND.test(text)) return 'UNDERSTAND';
  return 'UNKNOWN';
}

export function inferEvidenceTypeFromObjective(objective: string): AssessmentEvidenceType {
  const group = competencyGroup(objective);
  if (group === 'CREATE') return 'PRODUCT';
  if (group === 'PERFORMANCE') return 'PERFORMANCE';
  if (OBSERVATION.test(objective)) return 'OBSERVATION';
  return 'WRITTEN';
}

function questionCompetencyGroup(question: QuizQuestion): CompetencyGroup {
  return inferQuestionCognitiveDemand(question);
}

export function isQuestionCompatibleWithCompetency(question: QuizQuestion, target: CompetencyGroup): boolean {
  if (target === 'UNKNOWN') return true;
  const actual = questionCompetencyGroup(question);
  if (actual === 'UNKNOWN') return false;
  if (target === 'CREATE') return actual === 'CREATE';
  if (target === 'PERFORMANCE') return actual === 'PERFORMANCE';
  return COMPETENCY_RANK[actual] >= COMPETENCY_RANK[target];
}

export function validateObjectiveAlignment(
  objectives: string[],
  cp: string,
  topic: string,
  material?: MaterialAnalysis,
): { isAligned: boolean; issues: string[] } {
  const reference = significantWords([
    cp, topic, material?.title || '', material?.authenticContext || '',
    ...(material?.coreConcepts || []), ...(material?.subtopics || []),
    ...(material?.keyTerms || []), ...(material?.targetSkills || []),
  ].join(' '));
  const issues: string[] = [];

  objectives.forEach((objective, index) => {
    const words = significantWords(objective);
    const overlap = [...words].filter((word) => reference.has(word));
    if (competencyGroup(objective) === 'UNKNOWN') issues.push(`TP${index + 1} belum memiliki kata kerja kompetensi yang terdeteksi dengan jelas.`);
    if (reference.size >= 3 && overlap.length === 0) issues.push(`TP${index + 1} tidak menunjukkan keterkaitan konten yang cukup dengan CP/topik/materi.`);
  });
  return { isAligned: objectives.length > 0 && issues.length === 0, issues };
}

export function isQuestionCompetencyCompatible(question: QuizQuestion, objective: string): boolean {
  return isQuestionCompatibleWithCompetency(question, competencyGroup(objective));
}

function significantWords(text: string): Set<string> {
  return new Set((text || '').toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word)));
}

export function validateWorksheetAlignment(worksheet: LKPDSection | undefined, objectives: string[]): { isAligned: boolean; issues: string[] } {
  if (!worksheet) return { isAligned: false, issues: ['LKPD belum tersedia.'] };
  const worksheetText = [
    ...(worksheet.objectives || []), worksheet.problemFormulation || '',
    ...(worksheet.investigationTasks || []), ...(worksheet.solutionFinding || []),
    worksheet.challengeOrProductPrompt || '',
  ].join(' ');
  const worksheetWords = significantWords(worksheetText);
  const issues = objectives.flatMap((objective, index) => {
    const objectiveWords = significantWords(objective);
    const overlaps = [...objectiveWords].some((word) => worksheetWords.has(word));
    return objectiveWords.size >= 2 && !overlaps ? [`LKPD belum menunjukkan keterkaitan yang cukup dengan TP${index + 1}.`] : [];
  });
  return { isAligned: objectives.length > 0 && issues.length === 0, issues };
}

export function validatePedagogicalPlan(plan: PedagogicalPlan): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!plan?.objectives?.length || plan.objectives.length < 3) issues.push('Blueprint pedagogis harus memiliki minimal 3 TP.');
  const refs = new Set(plan?.objectives?.map((item) => item.ref));

  plan?.objectives?.forEach((objective) => {
    const blueprint = plan.assessmentBlueprint?.find((item) => item.objectiveRef === objective.ref);
    if (!blueprint) issues.push(`${objective.ref} belum memiliki assessment blueprint.`);
    const inferred = inferEvidenceTypeFromObjective(objective.objective);
    if (inferred === 'PRODUCT' && blueprint?.primaryEvidenceType !== 'PRODUCT') issues.push(`${objective.ref} meminta produk tetapi evidence utama bukan PRODUCT.`);
    if (inferred === 'PERFORMANCE' && blueprint?.primaryEvidenceType !== 'PERFORMANCE') issues.push(`${objective.ref} meminta unjuk kerja tetapi evidence utama bukan PERFORMANCE.`);
    if (inferred === 'OBSERVATION' && blueprint?.primaryEvidenceType !== 'OBSERVATION') issues.push(`${objective.ref} meminta observasi/pengamatan tetapi evidence utama bukan OBSERVATION.`);
  });

  plan?.assessmentBlueprint?.forEach((item) => {
    if (!refs.has(item.objectiveRef)) issues.push(`Assessment blueprint mengacu ke ${item.objectiveRef} yang tidak tersedia.`);
  });

  const itemIds = new Set<string>();
  (plan?.assessmentItems || []).forEach((item) => {
    if (itemIds.has(item.id)) issues.push(`Assessment item blueprint memiliki ID duplikat ${item.id}.`);
    itemIds.add(item.id);
    if (!refs.has(item.objectiveRef)) issues.push(`${item.id} mengacu ke ${item.objectiveRef} yang tidak tersedia.`);
    if (!['PG', 'Uraian'].includes(item.questionType)) issues.push(`${item.id} memiliki tipe soal yang tidak didukung.`);
    if (!['PRIMARY', 'SUPPORTING'].includes(item.role)) issues.push(`${item.id} memiliki role asesmen yang tidak valid.`);
  });

  return { valid: issues.length === 0, issues };
}
