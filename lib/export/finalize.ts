import type { RPPData } from '../../types/rpp';

function stripDraftLabel(value: string): string {
  return (value || '')
    .replace(/^\s*Draft\s+saran\s+AI\s*\([^)]*\)\s*:\s*/i, '')
    .replace(/^\s*Draft\s+AI\s*[-–—:]?\s*/i, '')
    .replace(/\s*\(Draft\s+AI[^)]*\)\s*$/i, '')
    .trim();
}

/**
 * Creates a presentation-only copy for DOCX/PDF export.
 * Review metadata remains in app storage, but never leaks into the final teacher document.
 */
export function prepareFinalExportRPP(rpp: RPPData): RPPData {
  const { qualityCheck: _legacyQualityCheck, ...base } = rpp as RPPData & { qualityCheck?: unknown };
  return {
    ...base,
    status: 'Selesai',
    sensitiveWarningNote: undefined,
    identity: {
      ...rpp.identity,
      element: stripDraftLabel(rpp.identity.element),
      learningOutcomes: stripDraftLabel(rpp.identity.learningOutcomes),
      elementSource: 'manual',
      cpSource: 'manual',
      gradeAdaptationNote: undefined,
    },
  };
}
