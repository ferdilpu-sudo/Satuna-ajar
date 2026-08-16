import type { MaterialAnalysis } from '../../types/rpp';

const MONTHS = 'Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember';

function normalizeAnchor(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:]+$/g, '').trim();
}

function canonicalNumberedRules(text: string, label: string, names: string): string[] {
  const pattern = new RegExp(`\\b(?:${names})\\s*(?:Nomor|No\\.?)?\\s*(\\d+)\\s*(?:\\/|\\s+Tahun\\s+|\\s+)(\\d{4})\\b`, 'gi');
  return [...text.matchAll(pattern)].map((match) => `${label}:${match[1]}:${match[2]}`);
}

function extractRegulationAnchors(text: string): string[] {
  const numbered = [
    ...canonicalNumberedRules(text, 'uu', 'UU|Undang-Undang'),
    ...canonicalNumberedRules(text, 'pp', 'PP|Peraturan Pemerintah'),
    ...canonicalNumberedRules(text, 'permen', 'Permendikbudristek|Permendikbud|Permendikdasmen|Permen'),
  ];
  const decisions = (text.match(/\b(?:KEP|Keputusan)\s*[-A-Z0-9./]+\d{4}\b/gi) || []).map(normalizeAnchor);
  return [...numbered, ...decisions];
}

function extractDateAnchors(text: string): string[] {
  const fullDates = text.match(new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\b`, 'gi')) || [];
  const years = text.match(/\b(?:1[5-9]\d{2}|20\d{2})\b/g) || [];
  return [...fullDates, ...years].map(normalizeAnchor);
}

export function extractFactAnchors(text: string): Set<string> {
  return new Set([...extractRegulationAnchors(text), ...extractDateAnchors(text)]);
}

export function buildSourceFactCorpus(material?: MaterialAnalysis): string {
  if (!material) return '';
  return [
    material.title,
    ...(material.subtopics || []),
    ...(material.coreConcepts || []),
    ...(material.keyFacts || []),
    ...(material.keyTerms || []),
    material.detectedCP,
    material.rawTextContext,
  ].filter(Boolean).join('\n');
}

export function findUnsupportedFactAnchors(material: MaterialAnalysis | undefined, generatedTexts: string[]): string[] {
  const sourceCorpus = buildSourceFactCorpus(material);
  if (!sourceCorpus.trim()) return [];
  const sourceAnchors = extractFactAnchors(sourceCorpus);
  const generatedAnchors = extractFactAnchors(generatedTexts.filter(Boolean).join('\n'));
  return [...generatedAnchors].filter((anchor) => !sourceAnchors.has(anchor));
}
