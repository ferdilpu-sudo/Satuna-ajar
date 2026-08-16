import type { RPPData } from '../types/rpp';

const CHOICE_PREFIX = /^\s*[A-Fa-f]\s*(?:[.):]|-)\s*/;

export function stripChoicePrefix(option: string): string {
  return (option || '').replace(CHOICE_PREFIX, '').trim();
}

export function formatChoiceOption(option: string, index: number): string {
  const label = String.fromCharCode(65 + Math.max(0, index));
  return `${label}. ${stripChoicePrefix(option) || '—'}`;
}

export function formatChoiceOptions(options?: string[]): string[] {
  return (options || []).map(formatChoiceOption);
}

export interface CompactDiagnosticItem {
  question: string;
  keyOrCriteria?: string;
}

export function getCompactDiagnostics(rpp: RPPData, limit = 4): CompactDiagnosticItem[] {
  return [
    ...(rpp.assessment?.diagnosticNonCognitive || []),
    ...(rpp.assessment?.diagnosticCognitive || []),
  ]
    .filter((item) => item.question?.trim())
    .slice(0, Math.max(0, limit))
    .map((item) => ({ question: item.question.trim(), keyOrCriteria: item.keyOrCriteria?.trim() || undefined }));
}

function compactCriterion(value: string): string {
  return (value || '')
    .replace(/^peserta didik\s+(?:mampu|dapat)\s+/i, '')
    .replace(/^mampu\s+/i, '')
    .trim();
}

export function getCompactFormativeChecklist(rpp: RPPData, limit = 4): string[] {
  const candidates = (rpp.successCriteria || [])
    .map((item) => compactCriterion(item.criteria))
    .filter(Boolean);
  const fallback = (rpp.assessment?.formative || [])
    .flatMap((item) => [item.purpose, item.instrument])
    .map(compactCriterion)
    .filter(Boolean);
  return [...new Set([...candidates, ...fallback])].slice(0, Math.max(0, limit));
}
