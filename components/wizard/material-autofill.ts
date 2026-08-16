import type { MaterialAnalysis, SchoolIdentity } from '../../types/rpp';

export interface MaterialAutofillValues {
  element: string;
  elementSource: NonNullable<SchoolIdentity['elementSource']>;
  topic: string;
  subtopic: string;
  learningOutcomes: string;
  cpSource: SchoolIdentity['cpSource'];
}


function summarizeSubtopics(values: string[] | undefined): string {
  const unique = [...new Set((values || []).map((value) => value.trim()).filter(Boolean))];
  return unique.slice(0, 4).join('; ');
}

export function buildMaterialAutofill(
  identity: SchoolIdentity,
  analysis: MaterialAnalysis,
): MaterialAutofillValues {
  const existingElement = identity.element.trim();
  const detectedElement = analysis.detectedElement?.trim() || '';
  const generatedElement = analysis.generatedElement?.trim() || '';
  const existingCP = identity.learningOutcomes.trim();
  const analyzedSubtopic = summarizeSubtopics(analysis.subtopics);
  const existingSubtopic = identity.subtopic.trim();
  const legacyTruncatedSubtopic = existingSubtopic.endsWith('...')
    && analyzedSubtopic.startsWith(existingSubtopic.slice(0, -3).trimEnd());
  const detectedCP = analysis.detectedCP?.trim() || '';
  const generatedCP = analysis.generatedCP?.trim() || '';

  return {
    element: existingElement || detectedElement || generatedElement,
    elementSource: existingElement
      ? identity.elementSource || 'manual'
      : detectedElement
        ? 'file'
        : generatedElement
          ? 'ai_draft'
          : 'manual',
    topic: identity.topic.trim() || analysis.title?.trim() || '',
    subtopic: !existingSubtopic || legacyTruncatedSubtopic ? analyzedSubtopic : existingSubtopic,
    learningOutcomes: existingCP || detectedCP || generatedCP,
    cpSource: existingCP
      ? identity.cpSource
      : detectedCP
        ? 'file'
        : generatedCP
          ? 'ai_draft'
          : 'manual',
  };
}
