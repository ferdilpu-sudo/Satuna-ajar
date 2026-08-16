import type { QuizQuestion } from '../../../../types/rpp';
import type { AssessmentItemPlan } from '../../../../types/pedagogy';

const STOP_WORDS = new Set([
  'peserta', 'didik', 'mampu', 'dengan', 'yang', 'untuk', 'dalam', 'secara', 'serta', 'dan', 'atau',
  'pada', 'dari', 'melalui', 'menjelaskan', 'menganalisis', 'mengidentifikasi', 'memahami', 'menentukan',
  'merancang', 'mengaplikasikan', 'membuat', 'menghasilkan', 'berdasarkan', 'terkait',
]);

function simpleStem(word: string): string {
  let result = word.toLowerCase();
  const prefixes = ['meng', 'meny', 'men', 'mem', 'ber', 'ter', 'peng', 'peny', 'pen', 'pem'];
  const suffixes = ['kan', 'nya', 'an'];

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

function significantWords(text: string): Set<string> {
  const words = (text || '').toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  const tokens = new Set<string>();
  words.forEach((word) => {
    tokens.add(word);
    const stem = simpleStem(word);
    if (stem.length > 3) tokens.add(stem);
  });
  return tokens;
}

function significantPhrases(text: string): Set<string> {
  const words = (text || '').toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  const phrases = new Set<string>();
  for (let index = 0; index < words.length - 1; index += 1) {
    phrases.add(`${simpleStem(words[index])} ${simpleStem(words[index + 1])}`);
  }
  return phrases;
}

export function objectiveSimilarityScore(question: QuizQuestion, objective: string): number {
  const questionText = `${question.question} ${question.indicator} ${question.correctAnswer}`;
  const questionWords = significantWords(questionText);
  const objectiveWords = significantWords(objective);
  const wordScore = [...objectiveWords].filter((word) => questionWords.has(word)).length;
  const questionPhrases = significantPhrases(questionText);
  const phraseScore = [...significantPhrases(objective)].filter((phrase) => questionPhrases.has(phrase)).length * 2;
  return wordScore + phraseScore;
}

export function repairObjectiveMappings(questions: QuizQuestion[], objectives: string[]): QuizQuestion[] {
  if (!objectives.length) return questions;

  return questions.map((question) => {
    const scores = objectives.map((objective) => objectiveSimilarityScore(question, objective));
    const ranked = scores.map((score, index) => ({ score, index }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];

    const directMatch = question.objectiveMeasured?.toUpperCase().match(/TP\s*([1-9]\d*)/);
    const directIndex = directMatch ? Number(directMatch[1]) - 1 : -1;
    const directValid = directIndex >= 0 && directIndex < objectives.length;
    const directScore = directValid ? scores[directIndex] : -1;

    if (!best || best.score <= 0) return { ...question, objectiveMeasured: directScore > 0 ? `TP${directIndex + 1}` : 'UNMAPPED' };

    const bestIsUnique = !second || best.score > second.score;
    const clearlyBetterThanDirect = directScore < 0 || best.score >= directScore + 2;
    const strongPhraseOrOverlap = best.score >= 2;
    const uniqueSingleSignal = best.score === 1 && (!second || second.score <= 0);

    if (best.index !== directIndex && bestIsUnique && clearlyBetterThanDirect && (strongPhraseOrOverlap || uniqueSingleSignal)) {
      return { ...question, objectiveMeasured: `TP${best.index + 1}` };
    }
    if (directScore > 0) return { ...question, objectiveMeasured: `TP${directIndex + 1}` };
    if (bestIsUnique && (strongPhraseOrOverlap || uniqueSingleSignal)) return { ...question, objectiveMeasured: `TP${best.index + 1}` };
    return { ...question, objectiveMeasured: 'UNMAPPED' };
  });
}


export function alignQuestionsToAssessmentPlan(
  questions: QuizQuestion[],
  items: AssessmentItemPlan[],
): QuizQuestion[] {
  if (!items?.length) return questions;
  const used = new Set<number>();
  const aligned: QuizQuestion[] = [];

  for (const item of items) {
    let questionIndex = questions.findIndex((question, index) =>
      !used.has(index) && question.id?.trim().toUpperCase() === item.id.toUpperCase() && question.type === item.questionType);
    if (questionIndex < 0) {
      questionIndex = questions.findIndex((question, index) => !used.has(index) && question.type === item.questionType);
    }
    if (questionIndex < 0) continue;

    used.add(questionIndex);
    const question = questions[questionIndex];
    aligned.push({
      ...question,
      id: item.id,
      type: item.questionType,
      objectiveMeasured: item.objectiveRef,
      evidenceRole: item.role,
      plannedCompetency: item.competency,
    });
  }
  return aligned;
}
