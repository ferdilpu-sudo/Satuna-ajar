import type { MaterialAnalysis, QuizQuestion, SchoolIdentity } from '../../../../types/rpp';
import type { PedagogicalPlan } from '../../../../types/pedagogy';
import { generateContentWithRetry } from '../../../../lib/gemini';
import { alignQuestionsToAssessmentPlan } from './assessment-mapping';
import { ASSESSMENT_REPAIR_SCHEMA } from './assessment-repair-schema';
import {
  findAssessmentRepairTargets,
  mergeAssessmentReplacements,
  type AssessmentRepairContext,
  type RepairTarget,
} from './assessment-repair-logic';
import { HUMAN_LANGUAGE_RULES } from './human-language';

interface AssessmentRepairInput {
  questions: QuizQuestion[];
  pedagogicalPlan: PedagogicalPlan;
  materialAnalysis: MaterialAnalysis;
  identity: SchoolIdentity;
}

export interface AssessmentRepairResult {
  questions: QuizQuestion[];
  repairedIds: string[];
  remainingIssues: string[];
  attempts: number;
}

function repairPrompt(context: AssessmentRepairContext, targets: RepairTarget[]): string {
  const objectiveMap = new Map(context.pedagogicalPlan.objectives.map((item) => [item.ref, item]));
  const repairSpecs = targets.map(({ item, current, issues }) => ({
    id: item.id,
    type: item.questionType,
    objectiveRef: item.objectiveRef,
    objective: objectiveMap.get(item.objectiveRef)?.objective || '',
    role: item.role,
    requiredCompetency: item.competency,
    contentFocus: item.contentFocus,
    problems: issues,
    currentQuestion: current || null,
  }));

  return `Perbaiki HANYA item asesmen yang gagal validasi. Jangan menulis bagian RPP/Modul lain.\n\nITEM YANG HARUS DIPERBAIKI:\n${JSON.stringify(repairSpecs, null, 2)}\n\nMATERI TERKUNCI:\nTopik/Subtopik: ${context.identity.topic} / ${context.identity.subtopic || 'Belum diisi'}\nKonsep: ${context.materialAnalysis.coreConcepts.join(', ')}\nIstilah: ${context.materialAnalysis.keyTerms.join(', ')}\nFakta yang boleh dipakai: ${context.materialAnalysis.keyFacts.join(' | ') || 'Tidak ada fakta spesifik'}\nKonteks: ${context.materialAnalysis.authenticContext || ''}\n${context.materialAnalysis.rawTextContext ? `Teks pendukung:\n${context.materialAnalysis.rawTextContext.slice(0, 6000)}` : ''}\n\nATURAN WAJIB:\n1. Kembalikan tepat satu question untuk setiap ID yang diminta, tanpa item tambahan.\n2. Pertahankan persis id, type, dan objectiveMeasured sesuai spesifikasi.\n3. PRIMARY harus mengukur kompetensi utama yang diminta. SUPPORTING boleh mengukur prasyarat, tetapi wajib pada requiredCompetency yang sudah ditetapkan.\n4. PG harus berbasis stimulus/skenario bila kompetensinya ANALYZE/EVALUATE; sediakan minimal 4 opsi yang masuk akal dan satu jawaban benar.\n5. Uraian harus memakai perintah operasional yang sesuai requiredCompetency.\n6. Jangan menambah angka, regulasi, tokoh, tanggal, atau fakta spesifik di luar materi terkunci.\n7. Pertanyaan, indikator, dan kunci harus konsisten serta tetap dalam ruang lingkup TP.\n8. Untuk efisiensi transfer energi, jangan mengarang persentase alternatif di luar materi sumber; gunakan "sekitar 10%" bila itu yang tersedia pada materi.
9. Periksa ulang hubungan sebab-akibat sebelum menetapkan kunci. Pada rantai atau jaring makanan, arah perubahan populasi predator dan mangsa harus konsisten.
10. Gunakan Bahasa Indonesia baku. Pertanyaan dan kunci harus terdengar alami seperti dibuat guru, bukan seperti teks akademik mesin.
${HUMAN_LANGUAGE_RULES}`;
}

export async function repairAssessmentQuestions(
  input: AssessmentRepairInput,
  maxAttempts = 2,
): Promise<AssessmentRepairResult> {
  const context: AssessmentRepairContext = {
    pedagogicalPlan: input.pedagogicalPlan,
    materialAnalysis: input.materialAnalysis,
    identity: input.identity,
  };
  let questions = alignQuestionsToAssessmentPlan(input.questions || [], input.pedagogicalPlan.assessmentItems || []);
  const repairedIds = new Set<string>();
  let attempts = 0;

  while (attempts < maxAttempts) {
    const targets = findAssessmentRepairTargets(context, questions);
    if (!targets.length) break;
    attempts += 1;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: repairPrompt(context, targets),
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: ASSESSMENT_REPAIR_SCHEMA,
      },
    }, 2, 800);
    const parsed = JSON.parse(response.text || '{}');
    const replacements = Array.isArray(parsed.questions) ? parsed.questions as QuizQuestion[] : [];
    targets.forEach((target) => repairedIds.add(target.item.id));
    questions = mergeAssessmentReplacements(questions, replacements, input.pedagogicalPlan);
  }

  const remainingTargets = findAssessmentRepairTargets(context, questions);
  return {
    questions,
    repairedIds: [...repairedIds],
    remainingIssues: remainingTargets.flatMap((target) => target.issues.map((issue) => `${target.item.id}: ${issue}`)),
    attempts,
  };
}
