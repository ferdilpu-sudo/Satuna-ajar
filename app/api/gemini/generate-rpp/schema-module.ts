import type { OutputConfig } from '../../../../types/rpp';
import {
  activityItem,
  bool,
  assessmentObject,
  dimensionItem,
  modelAndMethodsObject,
  object,
  objectArray,
  rubricItem,
  str,
  strArray,
  successCriteriaArray,
} from './schema-common';

export function buildModuleResponseSchema(output: OutputConfig) {
  const properties: Record<string, object> = {
    selectedDimensions: objectArray(dimensionItem),
    modelAndMethods: modelAndMethodsObject,
    partnership: str,
    environment: object({ physicalSpace: str, virtualSpace: str, learningCulture: str }, ['physicalSpace', 'virtualSpace', 'learningCulture']),
    digitalUse: objectArray(object({ tool: str, purpose: str }, ['tool', 'purpose'])),
    facilities: object({ tools: strArray, infrastructure: strArray, learningSources: strArray }, ['tools', 'infrastructure', 'learningSources']),
    learningObjectives: { ...strArray, description: '3-5 tujuan pembelajaran operasional, terukur, dan harus mengikuti blueprint' },
    successCriteria: successCriteriaArray,
    triggerQuestions: strArray,
    essentialMaterial: object({ coreConcept: str, subConcepts: strArray, keyTerms: strArray, summary: str }, ['coreConcept', 'subConcepts', 'keyTerms', 'summary']),
    activities: objectArray(activityItem),
    assessment: assessmentObject,
  };
  const required = Object.keys(properties);

  if (output.includeRubrics) {
    properties.performanceRubric = objectArray(rubricItem);
    properties.graduateProfileRubric = objectArray(rubricItem);
    properties.productRubric = objectArray(rubricItem);
    required.push('performanceRubric', 'graduateProfileRubric');
  }
  if (output.includeStudentReflection) {
    properties.studentReflectionQuestions = strArray;
    required.push('studentReflectionQuestions');
  }
  if (output.includeTeacherReflection) {
    properties.teacherReflectionQuestions = strArray;
    required.push('teacherReflectionQuestions');
  }
  if (output.includeRemedialEnrichment) {
    properties.remedialActivities = strArray;
    properties.enrichmentActivities = strArray;
    required.push('remedialActivities', 'enrichmentActivities');
  }
  if (output.includeLKPD) {
    properties.studentWorksheet = object({
      title: str,
      studentNamesPlaceholder: bool,
      objectives: strArray,
      stimulus: str,
      problemFormulation: str,
      studySteps: strArray,
      investigationTasks: strArray,
      solutionFinding: strArray,
      conclusionPrompt: str,
      challengeOrProductPrompt: str,
      answerPlaceholders: bool,
    }, ['title', 'objectives', 'stimulus', 'problemFormulation', 'studySteps', 'investigationTasks', 'solutionFinding', 'conclusionPrompt', 'challengeOrProductPrompt']);
    properties.teacherAnswerGuide = object({ expectedAnswers: strArray, keyConcepts: strArray, misconceptionNotes: strArray }, ['expectedAnswers', 'keyConcepts', 'misconceptionNotes']);
    required.push('studentWorksheet', 'teacherAnswerGuide');
  }
  return object(properties, required);
}
