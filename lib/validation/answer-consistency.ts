import type { QuizQuestion } from '../../types/rpp';

function normalize(value: string): string {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').replace(/[–—]/g, '-').trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function selectedAnswerText(question: QuizQuestion): string {
  const answer = (question.correctAnswer || '').trim();
  const letter = answer.match(/^([A-E])(?:[.)\s:-]|$)/i)?.[1]?.toUpperCase();
  if (letter && question.options?.length) {
    const index = letter.charCodeAt(0) - 65;
    return question.options[index] || answer;
  }
  return answer;
}

function answerMatchesOption(question: QuizQuestion): boolean {
  if (question.type !== 'PG' || !question.options?.length) return true;
  const answer = normalize(question.correctAnswer || '');
  if (!answer) return false;
  const letter = answer.match(/^([a-e])(?:[.)\s:-]|$)/i)?.[1];
  if (letter) return (letter.charCodeAt(0) - 97) < question.options.length;
  return question.options.some((option) => {
    const normalizedOption = normalize(option).replace(/^[a-e][.)\s:-]+/i, '').trim();
    const normalizedAnswer = answer.replace(/^[a-e][.)\s:-]+/i, '').trim();
    return normalizedOption === normalizedAnswer
      || normalizedOption.includes(normalizedAnswer)
      || normalizedAnswer.includes(normalizedOption);
  });
}

function extractArrowChain(question: string): string[] {
  const segment = question
    .split(/[.!?\n]/)
    .find((part) => (part.match(/(?:->|→)/g) || []).length >= 2);
  if (!segment) return [];
  const chainText = segment.includes(':') ? segment.slice(segment.lastIndexOf(':') + 1) : segment;
  return chainText.split(/\s*(?:->|→)\s*/)
    .map((item) => item.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ\s-]+$/g, '').trim())
    .filter((item) => item.length >= 2 && item.split(/\s+/).length <= 5);
}

function decreasedEntityIndex(question: string, chain: string[]): number {
  const text = normalize(question);
  const decreaseWords = '(?:menurun|berkurang|hilang|punah|dimusnahkan|diburu|ditangkap|dipanen|dihabiskan)';
  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const entity = normalize(chain[index]);
    const pattern = new RegExp(`${escapeRegex(entity)}[^.!?]{0,90}${decreaseWords}|${decreaseWords}[^.!?]{0,90}${escapeRegex(entity)}`, 'i');
    if (pattern.test(text)) return index;
  }
  return -1;
}

function directionNearEntity(answer: string, entity: string): 'UP' | 'DOWN' | undefined {
  const text = normalize(answer);
  const escaped = escapeRegex(normalize(entity));
  const up = new RegExp(`${escaped}[^,.;]{0,35}(?:meningkat|bertambah|melonjak|naik)`, 'i');
  const down = new RegExp(`${escaped}[^,.;]{0,35}(?:menurun|berkurang|merosot|turun)`, 'i');
  if (up.test(text)) return 'UP';
  if (down.test(text)) return 'DOWN';
  return undefined;
}

function trophicChainIssues(question: QuizQuestion): string[] {
  if (question.type !== 'PG') return [];
  const chain = extractArrowChain(question.question || '');
  if (chain.length < 3) return [];
  const impactedIndex = decreasedEntityIndex(question.question || '', chain);
  if (impactedIndex < 1) return [];

  const answer = selectedAnswerText(question);
  const issues: string[] = [];
  for (let index = impactedIndex - 1; index >= 0; index -= 1) {
    const distance = impactedIndex - index;
    const expected: 'UP' | 'DOWN' = distance % 2 === 1 ? 'UP' : 'DOWN';
    const stated = directionNearEntity(answer, chain[index]);
    if (stated && stated !== expected) {
      issues.push(`Kunci jawaban bertentangan dengan arah dampak berantai pada ${chain[index]}.`);
      break;
    }
  }
  return issues;
}

export function validateQuestionAnswerConsistency(question: QuizQuestion): string[] {
  const issues: string[] = [];
  if (!question.correctAnswer?.trim()) issues.push('Kunci jawaban belum tersedia.');
  if (!answerMatchesOption(question)) issues.push('Kunci jawaban pilihan ganda tidak cocok dengan opsi yang tersedia.');
  issues.push(...trophicChainIssues(question));
  return issues;
}
