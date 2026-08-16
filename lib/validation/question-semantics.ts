import type { QuizQuestion } from '../../types/rpp';
import type { AssessmentEvidenceRole, CompetencyGroup } from '../../types/pedagogy';

const CONTENT_STOP_WORDS = new Set([
  'peserta', 'didik', 'mampu', 'dengan', 'yang', 'untuk', 'dalam', 'secara', 'serta', 'dan', 'atau',
  'pada', 'dari', 'melalui', 'berdasarkan', 'tentang', 'sebagai', 'suatu', 'sebuah', 'terhadap', 'hasil',
  'jelaskan', 'uraikan', 'analisis', 'tentukan', 'manakah', 'berikan', 'bagaimana', 'mengapa', 'apakah',
  'menganalisis', 'mengidentifikasi', 'mengonstruksi', 'mengkonstruksi', 'memprediksi', 'merancang',
  'membuat', 'menyusun', 'menjelaskan', 'menentukan', 'menghasilkan', 'mengembangkan', 'merumuskan',
]);

const CREATE_DEMAND = /\b(rancang(?:lah)?|buat(?:lah)?|susun(?:lah)?|rumuskan(?:lah)?|kembangkan(?:lah)?|hasilkan|usulkan|ciptakan)\b/i;
const PERFORMANCE_DEMAND = /\b(demonstrasikan|praktikkan|peragakan|presentasikan|tampilkan|operasikan)\b/i;
const EVALUATE_DEMAND = /\b(evaluasi(?:lah)?|nilai(?:lah)?|kritisi|pertimbangkan|justifikasi)\b|(?:paling\s+(?:tepat|efektif|layak|sesuai))|(?:solusi[^?!.]{0,100}\b(?:berkelanjutan|efektif|layak)\b)/i;
const ANALYZE_DEMAND = /\b(analisis(?:lah)?|bandingkan|uraikan|prediksi(?:kan)?|hitung(?:lah)?|memprediksi|menganalisis|membandingkan|menghitung)\b|\bjelaskan\s+(?:mengapa|bagaimana)\b|\b(?:mengapa|apa\s+yang\s+akan\s+terjadi)\b|\b(?:dampak|akibat|pengaruh|sebab-akibat)\b/i;
const CONDITIONAL_ANALYSIS = /\b(jika|apabila|ketika|andaikan)\b/i;
const UNDERSTAND_DEMAND = /\b(apa|siapa|manakah|sebutkan|identifikasi(?:lah)?|tentukan|jelaskan|deskripsikan|kelompokkan|klasifikasikan|disebut|adalah|peran\s+utama|pola\s+interaksi)\b/i;

function normalizedQuestionStem(question: QuizQuestion): string {
  return (question.question || '').replace(/\s+/g, ' ').trim();
}

export function inferQuestionCognitiveDemand(question: QuizQuestion): CompetencyGroup {
  if (question.type === 'Produk') return 'CREATE';
  if (question.type === 'Kinerja') return 'PERFORMANCE';

  const stem = normalizedQuestionStem(question);
  if (!stem) return 'UNKNOWN';
  if (CREATE_DEMAND.test(stem)) return 'CREATE';
  if (PERFORMANCE_DEMAND.test(stem)) return 'PERFORMANCE';
  if (EVALUATE_DEMAND.test(stem)) return 'EVALUATE';
  if (ANALYZE_DEMAND.test(stem)) return 'ANALYZE';
  if (CONDITIONAL_ANALYSIS.test(stem) && /\b(dampak|terjadi|berubah|menurun|meningkat|kemungkinan|akibat|berapa|besarnya|jumlah|nilai)\b/i.test(stem)) return 'ANALYZE';
  if (UNDERSTAND_DEMAND.test(stem)) return 'UNDERSTAND';
  return 'UNKNOWN';
}


const INDICATOR_CREATE = /\b(merancang|membuat|menghasilkan|menyusun|mengembangkan|mencipta|merumuskan|mengonstruksi|mengkonstruksi)\b/i;
const INDICATOR_PERFORMANCE = /\b(mendemonstrasikan|mempraktikkan|melakukan|menyajikan|mempresentasikan|mengoperasikan)\b/i;
const INDICATOR_EVALUATE = /\b(mengevaluasi|menilai|mengkritisi|mempertimbangkan|memutuskan)\b/i;
const INDICATOR_ANALYZE = /\b(menganalisis|membandingkan|mengklasifikasikan|menghubungkan|menguraikan|membedakan|memprediksi|menghitung)\b/i;
const INDICATOR_UNDERSTAND = /\b(menjelaskan|mengidentifikasi|menentukan|menyebutkan|mendeskripsikan|memahami|mengenali)\b/i;
const INDICATOR_RANK: Record<CompetencyGroup, number> = { UNKNOWN: 0, UNDERSTAND: 1, ANALYZE: 2, EVALUATE: 3, CREATE: 4, PERFORMANCE: 4 };

function inferIndicatorDemand(value: string): CompetencyGroup {
  if (INDICATOR_CREATE.test(value)) return 'CREATE';
  if (INDICATOR_PERFORMANCE.test(value)) return 'PERFORMANCE';
  if (INDICATOR_EVALUATE.test(value)) return 'EVALUATE';
  if (INDICATOR_ANALYZE.test(value)) return 'ANALYZE';
  if (INDICATOR_UNDERSTAND.test(value)) return 'UNDERSTAND';
  return 'UNKNOWN';
}

const INDICATOR_VERB = /\b(merancang|membuat|menghasilkan|menyusun|mengembangkan|mencipta|merumuskan|mengonstruksi|mengkonstruksi|mendemonstrasikan|mempraktikkan|melakukan|menyajikan|mempresentasikan|mengoperasikan|mengevaluasi|menilai|mengkritisi|mempertimbangkan|memutuskan|menganalisis|membandingkan|mengklasifikasikan|menghubungkan|menguraikan|membedakan|memprediksi|menghitung|menjelaskan|mengidentifikasi|menentukan|menyebutkan|mendeskripsikan|memahami|mengenali)\b/i;

export function normalizeQuestionIndicator(question: QuizQuestion): QuizQuestion {
  const actual = inferQuestionCognitiveDemand(question);
  const claimed = inferIndicatorDemand(question.indicator || '');
  if (actual === 'UNKNOWN' || claimed === 'UNKNOWN' || INDICATOR_RANK[claimed] <= INDICATOR_RANK[actual]) return question;
  const verb: Partial<Record<CompetencyGroup, string>> = {
    UNDERSTAND: 'mengidentifikasi', ANALYZE: 'menganalisis', EVALUATE: 'menilai', CREATE: 'merancang', PERFORMANCE: 'mendemonstrasikan',
  };
  const replacement = verb[actual];
  if (!replacement) return question;
  return { ...question, indicator: (question.indicator || '').replace(INDICATOR_VERB, replacement) };
}

function simpleStem(word: string): string {
  let result = word.toLowerCase();
  const prefixes = ['meng', 'meny', 'men', 'mem', 'ber', 'ter', 'peng', 'peny', 'pen', 'pem', 'ke'];
  const suffixes = ['kan', 'nya', 'an', 'i'];
  for (const prefix of prefixes) {
    if (result.startsWith(prefix) && result.length - prefix.length >= 4) {
      result = result.slice(prefix.length);
      break;
    }
  }
  for (const suffix of suffixes) {
    if (result.endsWith(suffix) && result.length - suffix.length >= 4) {
      result = result.slice(0, -suffix.length);
      break;
    }
  }
  return result;
}

function contentTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  (text || '').toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !CONTENT_STOP_WORDS.has(word))
    .forEach((word) => {
      tokens.add(word);
      const stem = simpleStem(word);
      if (stem.length > 3) tokens.add(stem);
    });
  return tokens;
}

function overlapCount(reference: Set<string>, candidate: Set<string>): number {
  return [...reference].filter((token) => candidate.has(token)).length;
}

const SCIENCE_FOCUS_FAMILIES = {
  energy: /aliran energi|transfer energi|tingkat trofik|rantai makanan|jaring[- ]jaring makanan|piramida energi/i,
  biogeochemical: /daur biogeokimia|daur materi|siklus materi|daur karbon|daur nitrogen|daur air|siklus karbon|siklus nitrogen/i,
};

function hasConflictingScienceFocus(question: QuizQuestion, contentFocus: string): boolean {
  const focusFamilies = Object.entries(SCIENCE_FOCUS_FAMILIES)
    .filter(([, pattern]) => pattern.test(contentFocus))
    .map(([name]) => name);
  if (!focusFamilies.length) return false;

  const questionText = `${question.question || ''} ${question.indicator || ''}`;
  const questionFamilies = Object.entries(SCIENCE_FOCUS_FAMILIES)
    .filter(([, pattern]) => pattern.test(questionText))
    .map(([name]) => name);
  if (!questionFamilies.length) return false;

  const sharesPlannedFamily = questionFamilies.some((name) => focusFamilies.includes(name));
  const introducesOtherFamily = questionFamilies.some((name) => !focusFamilies.includes(name));
  return introducesOtherFamily && !sharesPlannedFamily;
}

export function questionContentAlignmentScore(question: QuizQuestion, contentFocus: string): { stem: number; withIndicator: number; focusSize: number } {
  const focus = contentTokens(contentFocus);
  if (!focus.size) return { stem: 0, withIndicator: 0, focusSize: 0 };
  const stemTokens = contentTokens(question.question || '');
  const expandedTokens = contentTokens(`${question.question || ''} ${question.indicator || ''}`);
  return {
    stem: overlapCount(focus, stemTokens),
    withIndicator: overlapCount(focus, expandedTokens),
    focusSize: focus.size,
  };
}

export function isQuestionContentAligned(
  question: QuizQuestion,
  contentFocus: string,
  role: AssessmentEvidenceRole = 'PRIMARY',
): boolean {
  const score = questionContentAlignmentScore(question, contentFocus);
  if (!score.focusSize) return true;
  if (role === 'SUPPORTING') return score.stem >= 1 || score.withIndicator >= 2;
  if (hasConflictingScienceFocus(question, contentFocus)) return false;
  const required = score.focusSize <= 3 ? 1 : 2;
  return score.stem >= 1 && score.withIndicator >= required;
}
