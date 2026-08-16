import type { LearningSettings, MaterialAnalysis, OutputConfig, SchoolIdentity, SelectedDimension } from '../../../../types/rpp';
import type { AssessmentEvidenceType, PedagogicalObjectivePlan, PedagogicalPlan } from '../../../../types/pedagogy';
import { generateContentWithRetry } from '../../../../lib/gemini';
import { assessModuleScope, moduleAuthenticObjectiveLimit, moduleObjectiveLimit } from '../../../../lib/validation/scope-feasibility';
import { buildAssessmentItemBlueprint } from './assessment-blueprint';
import { PEDAGOGICAL_PLAN_SCHEMA } from './planner-schema';
import { HUMAN_LANGUAGE_RULES } from './human-language';

interface PlannerInput {
  materialAnalysis: MaterialAnalysis;
  identity: SchoolIdentity;
  settings: LearningSettings;
  selectedDimensions: SelectedDimension[];
  outputConfig: OutputConfig;
}

const VALID_EVIDENCE = new Set<AssessmentEvidenceType>(['WRITTEN', 'PERFORMANCE', 'PRODUCT', 'OBSERVATION', 'MIXED']);
const PRODUCT = /merancang|membuat|menghasilkan|menyusun|mengembangkan|mencipta|mengonstruksi|mengkonstruksi|produk|poster|infografis|prototipe|karya/i;
const OBSERVATION = /(?:melalui|berdasarkan)\s+(?:(?:hasil|data)\s+)?(?:observasi|pengamatan|investigasi|penyelidikan)(?:\s+lapangan)?|(?:hasil|data)\s+(?:observasi|pengamatan|investigasi|penyelidikan)(?:\s+lapangan)?|observasi\s+lapangan|pengamatan\s+lapangan|investigasi\s+lapangan|penyelidikan\s+lapangan/i;
const PERFORMANCE = /mendemonstrasikan|mempraktikkan|melakukan|menyajikan|menyelidiki|bereksperimen|presentasi|unjuk kerja|praktik|praktikum|penyelidikan|investigasi|eksperimen|percobaan|(?:melalui\s+)?simulasi/i;

function inferEvidenceType(objective: string, proposed: string): AssessmentEvidenceType {
  if (PRODUCT.test(objective)) return 'PRODUCT';
  if (PERFORMANCE.test(objective)) return 'PERFORMANCE';
  if (OBSERVATION.test(objective)) return 'OBSERVATION';
  if (VALID_EVIDENCE.has(proposed as AssessmentEvidenceType)) return proposed as AssessmentEvidenceType;
  return 'WRITTEN';
}

function normalizeObjectiveText(value: string): string {
  return (value || '')
    .replace(/^(?:\s*TP\s*\d+\s*[:.)-]\s*)+/i, '')
    .replace(/\bmengkonstruksi\b/gi, 'mengonstruksi')
    .trim();
}

function selectObjectiveCandidates(items: PedagogicalObjectivePlan[], maxObjectives: number): PedagogicalObjectivePlan[] {
  const clean = items || [];
  if (clean.length <= maxObjectives) return clean;
  if (maxObjectives <= 1) return clean.slice(0, maxObjectives);
  return [...clean.slice(0, maxObjectives - 1), clean[clean.length - 1]];
}

function normalizeObjectives(items: PedagogicalObjectivePlan[], maxObjectives = 5): PedagogicalObjectivePlan[] {
  return selectObjectiveCandidates(items, maxObjectives).map((item, index) => {
    const objective = normalizeObjectiveText(item.objective);
    const firstVerb = objective.split(/\s+/)[0] || '';
    return {
      ...item,
      ref: `TP${index + 1}`,
      objective,
      competencyVerb: (item.competencyVerb || firstVerb).replace(/mengkonstruksi/gi, 'mengonstruksi').trim(),
      contentFocus: (item.contentFocus || '').trim(),
      evidenceType: inferEvidenceType(objective, item.evidenceType),
      criteriaFocus: (item.criteriaFocus || '').trim(),
    };
  }).filter((item) => item.objective.length > 10);
}

export function normalizePedagogicalPlan(
  plan: PedagogicalPlan,
  requestedModel: string,
  pgCount = 5,
  essayCount = 3,
  totalMinutes = 0,
  format: OutputConfig['format'] = 'Ringkas',
): PedagogicalPlan {
  const maxObjectives = format === 'Lengkap' && totalMinutes > 0 ? moduleObjectiveLimit(totalMinutes) : 5;
  const selectedObjectives = selectObjectiveCandidates(plan?.objectives || [], maxObjectives);
  const sourceRefs = selectedObjectives.map((item, index) => item.ref || `TP${index + 1}`);
  const objectives = normalizeObjectives(selectedObjectives, maxObjectives);
  const objectiveByRef = new Map(objectives.map((item) => [item.ref, item]));
  const sourceToNormalizedRef = new Map(sourceRefs.map((ref, index) => [ref, objectives[index]?.ref]));
  const resolvedModel = requestedModel !== 'Auto'
    ? requestedModel
    : (plan?.resolvedModel && plan.resolvedModel !== 'Auto' ? plan.resolvedModel : 'Problem Based Learning');

  const assessmentBlueprint = objectives.map((objective, index) => {
    const sourceRef = sourceRefs[index];
    const proposed = (plan?.assessmentBlueprint || []).find((item) => item.objectiveRef === sourceRef);
    const primaryEvidenceType = inferEvidenceType(objective.objective, proposed?.primaryEvidenceType || objective.evidenceType);
    const authentic = ['PRODUCT', 'PERFORMANCE', 'OBSERVATION'].includes(primaryEvidenceType);
    return {
      objectiveRef: objective.ref,
      primaryEvidenceType,
      writtenAssessmentAllowed: proposed?.writtenAssessmentAllowed ?? !authentic,
      instrumentHint: proposed?.instrumentHint?.trim() || (primaryEvidenceType === 'PRODUCT'
        ? 'Produk dengan rubrik produk'
        : primaryEvidenceType === 'PERFORMANCE' ? 'Unjuk kerja dengan rubrik kinerja'
          : primaryEvidenceType === 'OBSERVATION' ? 'Observasi dengan lembar observasi/catatan lapangan'
            : 'Tes tertulis dan/atau observasi'),
    };
  });

  const activityBlueprint = (plan?.activityBlueprint || [])
    .filter((item) => sourceToNormalizedRef.has(item.objectiveRef))
    .map((item) => {
      const objectiveRef = sourceToNormalizedRef.get(item.objectiveRef) || item.objectiveRef;
      return {
        objectiveRef,
        experience: ['MEMAHAMI', 'MENGAPLIKASI', 'MEREFLEKSI'].includes(item.experience) ? item.experience : 'MENGAPLIKASI',
        activityFocus: item.activityFocus?.trim() || objectiveByRef.get(objectiveRef)?.contentFocus || '',
      };
    }) as PedagogicalPlan['activityBlueprint'];

  const assessmentItems = buildAssessmentItemBlueprint(objectives, assessmentBlueprint, pgCount, essayCount);
  const scopeFeasibility = format === 'Lengkap' && totalMinutes > 0 ? assessModuleScope(objectives, totalMinutes) : undefined;
  return { resolvedModel, modelReason: plan?.modelReason || '', objectives, assessmentBlueprint, assessmentItems, scopeFeasibility, activityBlueprint };
}

function plannerPrompt(input: PlannerInput): string {
  const material = input.materialAnalysis;
  const totalMinutes = input.identity.totalMinutes || input.identity.jpCount * input.identity.durationPerJP * input.identity.meetingCount;
  const moduleScopeRule = input.outputConfig.format === 'Lengkap'
    ? `\n9. BUDGET MODUL AJAR: total ${totalMinutes} menit. Buat maksimal ${moduleObjectiveLimit(totalMinutes)} TP dan maksimal ${moduleAuthenticObjectiveLimit(totalMinutes)} TP dengan evidence autentik (PRODUCT/PERFORMANCE/OBSERVATION). Jangan memadatkan seluruh CP ke satu pertemuan; prioritaskan kompetensi esensial yang realistis selesai dalam waktu tersebut.\n10. Satu TP harus memiliki SATU kompetensi dominan. Jika ada proses pendukung, tulis sebagai frasa bawahan, misalnya "Merancang solusi ... berdasarkan analisis ...", bukan dua kata kerja utama yang setara.`
    : '';
  return `Susun BLUEPRINT PEDAGOGIS singkat. Jangan menulis RPP/Modul Ajar lengkap.\n\nIDENTITAS TERKUNCI:\nMapel: ${input.identity.subject}\nKelas/Fase: ${input.identity.grade} / ${input.identity.phase}\nElemen: ${input.identity.element || 'Belum diisi'}\nTopik/Subtopik: ${input.identity.topic} / ${input.identity.subtopic}\nCP: ${input.identity.learningOutcomes}\n\nMATERI:\nKonsep: ${material.coreConcepts.join(', ')}\nSubtopik: ${material.subtopics.join(', ')}\nKeterampilan: ${material.targetSkills.join(', ')}\nFakta: ${material.keyFacts.join(' | ')}\nPotensi produk: ${material.potentialProducts.join(', ')}\n\nPENGATURAN:\nModel: ${input.settings.model}\nDimensi: ${input.selectedDimensions.map((item) => item.name).join(', ')}\n\nATURAN:\n1. Buat 3-5 TP yang menurunkan kompetensi dari CP dan tetap dalam ruang lingkup materi.\n2. Setiap TP harus punya satu kata kerja kompetensi utama yang jelas.\n3. Jika TP meminta membuat/merancang/mendemonstrasikan/praktik/observasi/simulasi, evidence utama harus mengikuti MODALITAS tugas (PRODUCT/PERFORMANCE/OBSERVATION), bukan dipaksa menjadi tes tertulis.\n4. assessmentBlueprint wajib satu baris per TP.\n5. activityBlueprint harus menghubungkan TP ke MEMAHAMI/MENGAPLIKASI/MEREFLEKSI.\n6. Jangan menambahkan fakta spesifik baru di luar materi.\n7. Jika model input bukan Auto, pertahankan model tersebut.\n8. Gunakan Bahasa Indonesia baku. TP dan kriteria harus singkat, alami, dan mudah dipahami guru; jangan memakai jargon jika ada padanan sederhana.
${HUMAN_LANGUAGE_RULES}${moduleScopeRule}`;
}

export async function generatePedagogicalPlan(input: PlannerInput): Promise<PedagogicalPlan> {
  const response = await generateContentWithRetry({
    model: 'gemini-3.1-flash-lite',
    contents: plannerPrompt(input),
    config: { temperature: 0.15, responseMimeType: 'application/json', responseSchema: PEDAGOGICAL_PLAN_SCHEMA },
  }, 2, 1200);
  return normalizePedagogicalPlan(
    JSON.parse(response.text || '{}'),
    input.settings.model,
    input.outputConfig.pgCount,
    input.outputConfig.essayCount,
    input.identity.totalMinutes,
    input.outputConfig.format,
  );
}
