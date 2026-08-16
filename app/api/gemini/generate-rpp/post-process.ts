import type { PedagogicalPlan } from '../../../../types/pedagogy';
import type {
  LearningSettings,
  MaterialAnalysis,
  OutputConfig,
  RPPData,
  SchoolIdentity,
  SelectedDimension,
} from '../../../../types/rpp';
import {
  completeGraduateRubric,
  completeProductRubric,
  ensureReflections,
  normalizeAssessmentItems,
  normalizeLearningObjectives,
  lockSelectedDimensions,
  normalizeModelSyntaxLabels,
  normalizeSuccessCriteria,
  rebalanceActivityTime,
  resolveModel,
  sanitizeIdentity,
} from './post-process-helpers';
import { alignQuestionsToAssessmentPlan, repairObjectiveMappings } from './assessment-mapping';
import { cleanGeneratedTextFields } from './text-quality';
import { normalizeQuestionIndicator } from '../../../../lib/validation/question-semantics';
import { buildAssessmentExecutionPlan } from '../../../../lib/validation/assessment-execution';
import { syncModuleAssessmentActivities } from './assessment-activity-sync';

interface GeneratedPayload extends Partial<RPPData> {
  modelAndMethods?: { model?: string; methods?: string[]; academicReason?: string };
}

interface PostProcessInput {
  parsed: GeneratedPayload;
  identity: SchoolIdentity;
  settings: LearningSettings;
  materialAnalysis: MaterialAnalysis;
  selectedDimensions: SelectedDimension[];
  outputConfig: OutputConfig;
  sourceFiles: string[];
  pedagogicalPlan?: PedagogicalPlan;
}

function normalizeFacilities(
  facilities: GeneratedPayload['facilities'],
  identity: SchoolIdentity,
  material: MaterialAnalysis,
  isModule: boolean,
): RPPData['facilities'] {
  const safeLearningSources = (facilities?.learningSources || [])
    .map((source) => source.trim())
    .filter(Boolean)
    .filter((source) => !/(?:https?:\/\/|www\.)/i.test(source));

  const fallbackSources = isModule || safeLearningSources.length
    ? []
    : [
        `Buku teks ${identity.subject} ${identity.grade} yang digunakan sekolah`,
        `Materi pendukung guru yang relevan dengan topik ${material.title || identity.topic}`,
      ];

  return {
    tools: facilities?.tools || [],
    infrastructure: facilities?.infrastructure || [],
    learningSources: [...safeLearningSources, ...fallbackSources].slice(0, 4),
  };
}

function sensitiveWarning(material: MaterialAnalysis): { type: RPPData['sensitiveContentType']; note?: string } {
  const detected = material?.sensitiveContentType || (
    JSON.stringify(material || {}).match(/\b(uu|undang-undang|pasal|sanksi|pidana|peraturan|kebijakan)\b/i) ? 'LAW' : 'NONE'
  );
  if (!detected || detected === 'NONE') return { type: 'NONE' };
  return {
    type: detected,
    note: material.sensitiveWarningNote || 'Materi memuat informasi yang dapat berubah. Verifikasi fakta, regulasi, atau data terbaru pada sumber resmi sebelum digunakan.',
  };
}


export function buildRPPData(input: PostProcessInput): RPPData {
  const identity = sanitizeIdentity(input.identity);
  const parsed = cleanGeneratedTextFields(input.parsed);
  const resolvedModel = input.pedagogicalPlan?.resolvedModel || resolveModel(input.settings.model, parsed.modelAndMethods?.model);
  const dimensions = lockSelectedDimensions(input.selectedDimensions, parsed.selectedDimensions || []);
  const objectives = normalizeLearningObjectives(input.pedagogicalPlan?.objectives?.length
    ? input.pedagogicalPlan.objectives.map((item) => item.objective)
    : (parsed.learningObjectives || []));
  const successCriteria = normalizeSuccessCriteria(parsed.successCriteria || [], objectives);
  const rebalancedActivities = rebalanceActivityTime(parsed.activities || [], identity);
  const baseActivities = normalizeModelSyntaxLabels(rebalancedActivities, resolvedModel);
  const rawAssessmentItems = parsed.assessment?.summativeQuestions || [];
  const mappedQuestions = input.pedagogicalPlan?.assessmentItems?.length
    ? alignQuestionsToAssessmentPlan(rawAssessmentItems, input.pedagogicalPlan.assessmentItems)
    : repairObjectiveMappings(normalizeAssessmentItems(rawAssessmentItems, objectives), objectives);
  const questions = mappedQuestions.map(normalizeQuestionIndicator);
  const isModule = input.outputConfig.format === 'Lengkap';
  const diagnosticCognitive = isModule
    ? (parsed.assessment?.diagnosticCognitive || []).filter((item) => item.question?.trim()).slice(0, 4)
    : (parsed.assessment?.diagnosticCognitive || []);
  const executionPlan = isModule ? buildAssessmentExecutionPlan(questions, baseActivities) : undefined;
  const activities = isModule ? syncModuleAssessmentActivities(baseActivities, diagnosticCognitive.length, executionPlan) : baseActivities;
  const graduateRubric = isModule && input.outputConfig.includeRubrics ? completeGraduateRubric(dimensions, parsed.graduateProfileRubric || []) : [];
  const productRubric = input.outputConfig.includeRubrics ? completeProductRubric(parsed.productRubric || [], activities, objectives, identity.topic) : [];
  const studentReflection = ensureReflections(parsed.studentReflectionQuestions || [], isModule && input.outputConfig.includeStudentReflection, 'student');
  const teacherReflection = ensureReflections(parsed.teacherReflectionQuestions || [], isModule && input.outputConfig.includeTeacherReflection, 'teacher');
  const sensitive = sensitiveWarning(input.materialAnalysis);

  const assessment = {
    diagnosticNonCognitive: isModule ? [] : (parsed.assessment?.diagnosticNonCognitive || []),
    diagnosticCognitive,
    formative: parsed.assessment?.formative || [],
    summativeQuestions: questions,
    executionPlan,
  };


  const hasUploadedFile = input.sourceFiles.some((source) => source !== 'Materi Teks Pengguna');
  const now = new Date().toISOString();
  return {
    id: `rpp_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    status: 'Selesai',
    sensitiveContentType: sensitive.type,
    sensitiveWarningNote: sensitive.note,
    documentFormat: input.outputConfig.format || 'Ringkas',
    identity,
    selectedDimensions: dimensions,
    learningSettings: {
      model: resolvedModel,
      modelRecommendationReason: input.pedagogicalPlan?.modelReason || parsed.modelAndMethods?.academicReason || '',
      methods: parsed.modelAndMethods?.methods || input.settings.methods,
      partners: input.settings.partners,
      digitalTools: input.settings.digitalTools,
      modelSelectionMode: input.settings.model === 'Auto' ? 'AI_RECOMMENDED' : 'USER_SELECTED',
      resolvedModel,
    },
    partnership: parsed.partnership || 'Tidak memerlukan mitra eksternal secara khusus.',
    environment: parsed.environment || { physicalSpace: '', virtualSpace: '', learningCulture: '' },
    digitalUse: parsed.digitalUse || [],
    facilities: normalizeFacilities(parsed.facilities, identity, input.materialAnalysis, isModule),
    learningObjectives: objectives,
    successCriteria,
    triggerQuestions: parsed.triggerQuestions || [],
    essentialMaterial: parsed.essentialMaterial || { coreConcept: '', subConcepts: [], keyTerms: [], summary: '' },
    activities,
    assessment,
    performanceRubric: parsed.performanceRubric || [],
    graduateProfileRubric: graduateRubric,
    productRubric,
    studentReflectionQuestions: studentReflection,
    teacherReflectionQuestions: teacherReflection,
    remedialActivities: isModule && input.outputConfig.includeRemedialEnrichment ? (parsed.remedialActivities || []) : [],
    enrichmentActivities: isModule && input.outputConfig.includeRemedialEnrichment ? (parsed.enrichmentActivities || []) : [],
    studentWorksheet: isModule && input.outputConfig.includeLKPD ? parsed.studentWorksheet : undefined,
    teacherAnswerGuide: isModule && input.outputConfig.includeLKPD ? parsed.teacherAnswerGuide : undefined,
    sourcesUsed: input.sourceFiles.length ? input.sourceFiles : ['Materi Teks Pengguna'],
    sourceType: hasUploadedFile ? 'USER_FILE' : 'USER_INPUT',
    sourceRefs: input.sourceFiles,
    researchSources: [...(input.materialAnalysis.webSources || [])],
    webSearchQueries: input.materialAnalysis.webSearchQueries || [],
    searchEntryPointHtml: input.materialAnalysis.searchEntryPointHtml,
  };
}
