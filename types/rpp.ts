import type { AssessmentExecutionPlan, SuccessCriterion } from './assessment';

export interface WebResearchSource {
  title: string;
  url: string;
  domain?: string;
}

export interface MaterialAnalysis {
  title: string;
  subtopics: string[];
  coreConcepts: string[];
  prerequisiteConcepts: string[];
  keyTerms: string[];
  keyFacts: string[];
  targetSkills: string[];
  authenticContext: string;
  potentialProducts: string[];
  potentialActivities: string[];
  potentialAssessments: string[];
  rawTextContext?: string;
  detectedLevel?: string;
  detectedGrade?: string;
  detectedPhase?: string;
  detectedSubject?: string;
  detectedElement?: string;
  generatedElement?: string;
  detectedCP?: string;
  generatedCP?: string;
  sensitiveContentType?: 'LAW' | 'HEALTH' | 'STATISTICS' | 'POLICY' | 'NONE';
  sensitiveWarningNote?: string;
  webResearchUsed?: boolean;
  webSearchQueries?: string[];
  webSources?: WebResearchSource[];
  searchEntryPointHtml?: string;
}

export interface SchoolIdentity {
  teacherName: string;
  schoolName: string;
  academicYear: string;
  educationLevel: 'SD/MI' | 'SMP/MTs' | 'SMA/MA' | 'SMK/MAK' | string;
  subject: string;
  grade: string;
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;
  semester: 'Ganjil' | 'Genap' | '1' | '2' | string;
  element: string;
  elementSource?: 'manual' | 'file' | 'ai_draft';
  topic: string;
  subtopic: string;
  jpCount: number;
  durationPerJP: number; // minutes
  meetingCount: number;
  totalMinutes: number; // jpCount * durationPerJP * meetingCount
  learningOutcomes: string; // CP
  cpSource: 'manual' | 'file' | 'ai_draft';
  gradeAdaptationNote?: string;
}

export interface LearningSettings {
  model: 'Auto' | 'Problem Based Learning' | 'Project Based Learning' | 'Inquiry Learning' | 'Discovery Learning' | 'Cooperative Learning' | 'Contextual Teaching and Learning' | 'Eksperimen' | 'Pembelajaran Langsung' | string;
  modelRecommendationReason?: string;
  methods: string[];
  partners: string[];
  digitalTools: string[];
  modelSelectionMode?: 'AI_RECOMMENDED' | 'USER_SELECTED';
  resolvedModel?: string;
}

export interface SelectedDimension {
  name: string;
  reason: string;
  indicator: string;
  activity: string;
  evidence: string;
}

export interface OutputConfig {
  format: 'Lengkap' | 'Ringkas';
  pgCount: number;
  essayCount: number;
  includeLKPD: boolean;
  includeRubrics: boolean;
  includeRemedialEnrichment: boolean;
  includeStudentReflection: boolean;
  includeTeacherReflection: boolean;
}

export interface LearningActivityItem {
  stage: 'PENDAHULUAN' | 'KEGIATAN INTI' | 'PENUTUP';
  meetingNumber?: number; // 1-based index for multi-meeting scenarios
  syntaxOrPrinciple: string;
  description: string; // Clear teacher & student behavior
  experience: 'MEMAHAMI' | 'MENGAPLIKASI' | 'MEREFLEKSI';
  deepLearningBadges?: ('Berkesadaran' | 'Bermakna' | 'Menggembirakan')[];
  timeMinutes: number;
  scaffoldingNotes?: string;
  sourceType?: 'USER_FILE' | 'USER_INPUT' | 'AI_DERIVED' | 'AI_SUPPLEMENT';
  sourceRefs?: string[];
}

export interface DiagnosticQuestion {
  category: 'Non-Kognitif' | 'Kognitif';
  aspectOrTopic: string;
  question: string;
  keyOrCriteria?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'PG' | 'Uraian' | 'Kinerja' | 'Produk';
  question: string;
  options?: string[]; // for PG: A, B, C, D
  correctAnswer: string;
  indicator: string;
  objectiveMeasured: string;
  maxScore?: number;
  evidenceRole?: 'PRIMARY' | 'SUPPORTING';
  plannedCompetency?: 'CREATE' | 'PERFORMANCE' | 'EVALUATE' | 'ANALYZE' | 'UNDERSTAND' | 'UNKNOWN';
}

export interface RubricLevel {
  score: number;
  description: string;
}

export interface RubricItem {
  aspect: string;
  indicator: string;
  levels: {
    score1: string;
    score2: string;
    score3: string;
    score4: string;
  };
}

export interface LKPDSection {
  title: string;
  studentNamesPlaceholder: boolean;
  objectives: string[];
  stimulus: string; // based on material
  problemFormulation: string;
  studySteps: string[];
  investigationTasks: string[];
  solutionFinding: string[];
  conclusionPrompt: string;
  challengeOrProductPrompt: string;
  answerPlaceholders: boolean;
}

export interface RPPData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'Draft' | 'Selesai';
  sensitiveContentType?: 'LAW' | 'HEALTH' | 'STATISTICS' | 'POLICY' | 'NONE';
  sensitiveWarningNote?: string;
  documentFormat?: 'Ringkas' | 'Lengkap';
  
  // Metadata & Identity
  identity: SchoolIdentity;
  
  // Dimensions
  selectedDimensions: SelectedDimension[];
  
  // Model & Methods
  learningSettings: LearningSettings;
  
  // Learning Framework
  partnership: string;
  environment: {
    physicalSpace: string;
    virtualSpace: string;
    learningCulture: string;
  };
  digitalUse: {
    tool: string;
    purpose: string;
  }[];
  facilities: {
    tools: string[];
    infrastructure: string[];
    learningSources: string[];
  };
  
  // Objectives & Criteria
  learningObjectives: string[];
  successCriteria: SuccessCriterion[];
  
  // Trigger Questions & Essential Material
  triggerQuestions: string[];
  essentialMaterial: {
    coreConcept: string;
    subConcepts: string[];
    keyTerms: string[];
    summary: string;
  };
  
  // Steps (Deep Learning)
  activities: LearningActivityItem[];
  
  // Assessment
  assessment: {
    diagnosticNonCognitive: DiagnosticQuestion[];
    diagnosticCognitive: DiagnosticQuestion[];
    formative: {
      technique: string;
      instrument: string;
      timing: string;
      purpose: string;
    }[];
    summativeQuestions: QuizQuestion[];
    executionPlan?: AssessmentExecutionPlan;
  };
  
  // Rubrics
  performanceRubric: RubricItem[];
  graduateProfileRubric: RubricItem[];
  productRubric?: RubricItem[];
  
  // Reflections
  studentReflectionQuestions: string[];
  teacherReflectionQuestions: string[];
  
  // Remedial & Enrichment
  remedialActivities: string[];
  enrichmentActivities: string[];
  
  // Appendix (LKPD)
  studentWorksheet?: LKPDSection;
  teacherAnswerGuide?: {
    expectedAnswers: string[];
    keyConcepts: string[];
    misconceptionNotes: string[];
  };
  
  // Sources & Verification
  sourcesUsed: string[];
  sourceType?: 'USER_FILE' | 'USER_INPUT' | 'AI_DERIVED' | 'AI_SUPPLEMENT';
  sourceRefs?: string[];
  researchSources?: WebResearchSource[];
  webSearchQueries?: string[];
  searchEntryPointHtml?: string;
}

export interface RPPTemplate {
  id: string;
  name: string;
  model: string;
  description: string;
  suitableSubjects: string[];
  syntaxSteps: string[];
}
