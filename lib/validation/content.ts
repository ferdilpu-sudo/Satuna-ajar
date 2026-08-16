import type { LearningActivityItem, QuizQuestion, RubricItem, SelectedDimension } from '../../types/rpp';

const DOMAIN_KEYWORDS = {
  biology: ['ekosistem', 'rantai makanan', 'biotik', 'abiotik', 'fotosintesis', 'reproduksi', 'tumbuhan', 'sel', 'jaringan'],
  economy: ['lembaga keuangan', 'bank', 'uang', 'transaksi', 'pasar', 'inflasi', 'ekonomi', 'perdagangan', 'koperasi', 'pegadaian'],
  physics: ['kecepatan', 'percepatan', 'gaya', 'energi', 'listrik', 'magnet', 'gelombang', 'vektor'],
};

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function validateCPAlignment(cpText: string, subject: string, topic: string): { isAligned: boolean; reason?: string } {
  if (!cpText || cpText.trim().length < 10) {
    return { isAligned: false, reason: 'Capaian Pembelajaran (CP) belum diisi.' };
  }

  const cp = cpText.toLowerCase();
  const context = `${subject} ${topic}`.toLowerCase();
  const cpBio = includesAny(cp, DOMAIN_KEYWORDS.biology);
  const cpEco = includesAny(cp, DOMAIN_KEYWORDS.economy);
  const cpPhys = includesAny(cp, DOMAIN_KEYWORDS.physics);
  const ctxBio = includesAny(context, DOMAIN_KEYWORDS.biology) || /\bipa\b|biologi/.test(context);
  const ctxEco = includesAny(context, DOMAIN_KEYWORDS.economy) || /\bips\b|ekonomi/.test(context);
  const ctxPhys = includesAny(context, DOMAIN_KEYWORDS.physics) || /fisika/.test(context);

  if (ctxEco && cpBio && !cpEco) return { isAligned: false, reason: `CP bertema biologi/ekosistem tidak sesuai dengan topik '${topic}' (${subject}).` };
  if (ctxBio && cpEco && !cpBio) return { isAligned: false, reason: `CP bertema ekonomi/lembaga keuangan tidak sesuai dengan topik '${topic}' (${subject}).` };
  if (ctxPhys && cpBio && !cpPhys) return { isAligned: false, reason: `CP tidak mencerminkan topik fisika '${topic}'.` };
  return { isAligned: true };
}

export function validateModelSyntax(resolvedModel: string, activities: LearningActivityItem[]): boolean {
  if (!resolvedModel || resolvedModel === 'Auto' || !activities?.length) return false;
  const model = resolvedModel.toLowerCase();
  const syntaxText = activities.map((item) => item.syntaxOrPrinciple).join(' ').toLowerCase();
  const coreSyntaxText = activities.filter((item) => item.stage === 'KEGIATAN INTI')
    .map((item) => item.syntaxOrPrinciple).join(' ').toLowerCase();
  const has = (text: string, keywords: string[], minimum: number) => keywords.filter((keyword) => text.includes(keyword)).length >= minimum;

  if (model.includes('problem based') || model.includes('pbl')) return has(coreSyntaxText, ['orient', 'organisasi', 'penyelidikan', 'karya', 'evaluasi'], 5);
  if (model.includes('project based') || model.includes('pjbl')) return has(syntaxText, ['pertanyaan', 'proyek', 'jadwal', 'monitor', 'uji', 'evaluasi'], 4);
  if (model.includes('inquiry')) return has(syntaxText, ['rumusan masalah', 'hipotesis', 'data', 'pengujian', 'kesimpulan'], 3);
  return true;
}

export function objectiveReference(index: number): string {
  return `TP${index + 1}`;
}

export function getAssessedObjectiveRefs(questions: QuizQuestion[], objectives: string[]): Set<string> {
  const refs = new Set<string>();
  for (const question of questions || []) {
    const raw = (question.objectiveMeasured || '').trim();
    const direct = raw.toUpperCase().match(/TP\s*([1-9]\d*)/);
    if (direct) {
      refs.add(`TP${Number(direct[1])}`);
      continue;
    }
    const objectiveIndex = objectives.findIndex((objective) => objective === raw || objective.toLowerCase() === raw.toLowerCase());
    if (objectiveIndex >= 0) refs.add(objectiveReference(objectiveIndex));
  }
  return refs;
}

export function allObjectivesHaveAssessment(questions: QuizQuestion[], objectives: string[]): boolean {
  if (!objectives.length || !questions.length) return false;
  const assessed = getAssessedObjectiveRefs(questions, objectives);
  return objectives.every((_, index) => assessed.has(objectiveReference(index)));
}

export function hasProductActivity(activities: LearningActivityItem[], learningObjectives: string[] = []): boolean {
  const text = `${activities?.map((item) => item.description).join(' ') || ''} ${learningObjectives.join(' ')}`;
  return /poster|infografis|video|presentasi|prototipe|laporan|produk|karya|bank soal|podcast/i.test(text);
}

export function isGraduateProfileRubricComplete(dimensions: SelectedDimension[], rubrics: RubricItem[]): boolean {
  const aspects = (rubrics || []).map((rubric) => rubric.aspect.toLowerCase());
  return (dimensions || []).every((dimension) => aspects.some((aspect) => aspect.includes(dimension.name.toLowerCase())));
}
