import { Type } from '@google/genai';

export const str = { type: Type.STRING } as const;
export const bool = { type: Type.BOOLEAN } as const;
export const int = { type: Type.INTEGER } as const;
export const strArray = { type: Type.ARRAY, items: str } as const;
export const objectArray = (items: object) => ({ type: Type.ARRAY, items });
export const object = (properties: object, required: string[]) => ({ type: Type.OBJECT, properties, required });

export const rubricItem = object({
  aspect: str,
  indicator: str,
  levels: object({ score1: str, score2: str, score3: str, score4: str }, ['score1', 'score2', 'score3', 'score4']),
}, ['aspect', 'indicator', 'levels']);

export const dimensionItem = object({
  name: str,
  reason: str,
  indicator: str,
  activity: str,
  evidence: str,
}, ['name', 'reason', 'indicator', 'activity', 'evidence']);

export const activityItem = object({
  stage: str,
  meetingNumber: int,
  syntaxOrPrinciple: str,
  description: str,
  experience: str,
  deepLearningBadges: strArray,
  timeMinutes: int,
  scaffoldingNotes: str,
}, ['stage', 'meetingNumber', 'syntaxOrPrinciple', 'description', 'experience', 'deepLearningBadges', 'timeMinutes']);

const diagnosticBase = { category: str, aspectOrTopic: str, question: str };
export const formativeItem = object({
  technique: str,
  instrument: str,
  timing: str,
  purpose: str,
}, ['technique', 'instrument', 'timing', 'purpose']);

export const summativeItem = object({
  id: str,
  type: { type: Type.STRING, description: 'PG | Uraian | Kinerja | Produk' },
  question: str,
  options: strArray,
  correctAnswer: str,
  indicator: str,
  objectiveMeasured: { type: Type.STRING, description: 'Gunakan persis TP1, TP2, dst, atau UNMAPPED' },
  maxScore: int,
}, ['id', 'type', 'question', 'correctAnswer', 'indicator', 'objectiveMeasured']);

export const assessmentObject = object({
  diagnosticNonCognitive: objectArray(object(diagnosticBase, ['category', 'aspectOrTopic', 'question'])),
  diagnosticCognitive: objectArray(object({ ...diagnosticBase, keyOrCriteria: str }, ['category', 'aspectOrTopic', 'question', 'keyOrCriteria'])),
  formative: objectArray(formativeItem),
  summativeQuestions: objectArray(summativeItem),
}, ['diagnosticNonCognitive', 'diagnosticCognitive', 'formative', 'summativeQuestions']);

export const modelAndMethodsObject = object({
  model: str,
  methods: strArray,
  approach: str,
  academicReason: str,
}, ['model', 'methods', 'approach', 'academicReason']);

export const successCriteriaArray = objectArray(object({
  objective: str,
  criteria: str,
  assessmentEvidence: str,
}, ['objective', 'criteria', 'assessmentEvidence']));
