import type { OutputConfig } from '../../../../types/rpp';
import {
  activityItem,
  assessmentObject,
  modelAndMethodsObject,
  object,
  objectArray,
  rubricItem,
  strArray,
  successCriteriaArray,
} from './schema-common';

export function buildRPPResponseSchema(output: OutputConfig) {
  const properties: Record<string, object> = {
    modelAndMethods: modelAndMethodsObject,
    facilities: object({
      tools: strArray,
      infrastructure: strArray,
      learningSources: {
        ...strArray,
        description: '2-4 saran sumber belajar non-URL yang realistis dan relevan dengan topik. Jangan membuat judul buku, penerbit, atau tautan spesifik yang tidak diberikan sumber.',
      },
    }, ['tools', 'infrastructure', 'learningSources']),
    learningObjectives: { ...strArray, description: '3-5 tujuan pembelajaran operasional, terukur, dan harus mengikuti blueprint' },
    successCriteria: successCriteriaArray,
    activities: objectArray(activityItem),
    assessment: assessmentObject,
  };
  const required = ['modelAndMethods', 'facilities', 'learningObjectives', 'successCriteria', 'activities', 'assessment'];

  if (output.includeRubrics) {
    properties.performanceRubric = objectArray(rubricItem);
    properties.productRubric = objectArray(rubricItem);
  }
  if (output.includeStudentReflection) properties.studentReflectionQuestions = strArray;
  if (output.includeTeacherReflection) properties.teacherReflectionQuestions = strArray;

  return object(properties, required);
}
