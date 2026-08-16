import type { SuccessCriterion } from '../../../../types/assessment';
import type {
  LearningActivityItem,
  QuizQuestion,
  RubricItem,
  SchoolIdentity,
  SelectedDimension,
} from '../../../../types/rpp';
import { hasProductActivity, inferEvidenceTypeFromObjective, normalizeEducationLevel, normalizeGrade, normalizePhase } from '../../../../lib/validation';
import { structureSuccessCriterionEvidence } from '../../../../lib/validation/evidence-structure';
import { objectiveSimilarityScore } from './assessment-mapping';

const DEEP_LEARNING_BADGES = ['Berkesadaran', 'Bermakna', 'Menggembirakan'] as const;
const AUTHENTIC_ASSESSMENT_PATTERN = /produk|kartu|poster|infografis|video|prototipe|karya|portofolio|proposal|rancangan\s+(?:aksi|solusi|produk|proyek)|usulan\s+(?:aksi|solusi)|presentasi|demonstrasi|praktik/i;
const PRODUCT_TASK_PATTERN = /buat(?:lah)?|rancang|hasilkan|produk|kartu|poster|infografis|video|prototipe|karya|portofolio|proposal|usulan\s+(?:aksi|solusi)/i;
const PERFORMANCE_TASK_PATTERN = /praktik|demonstrasi|presentasi|peragakan|tampilkan/i;

const PBL_SYNTAX = {
  orient: 'Tahap 1 PBL: Memahami Masalah',
  organize: 'Tahap 2 PBL: Mengatur Kerja Kelompok',
  combined: 'Tahap 1–2 PBL: Memahami Masalah & Mengatur Kerja Kelompok',
  investigate: 'Tahap 3 PBL: Penyelidikan',
  present: 'Tahap 4 PBL: Menyusun dan Menyajikan Hasil',
  evaluate: 'Tahap 5 PBL: Menilai Proses dan Hasil',
} as const;

export function sanitizeIdentity(identity: SchoolIdentity): SchoolIdentity {
  return {
    ...identity,
    teacherName: identity.teacherName?.trim() || 'Belum diisi',
    schoolName: identity.schoolName?.trim() || 'Belum diisi',
    educationLevel: normalizeEducationLevel(identity.educationLevel),
    grade: normalizeGrade(identity.grade),
    phase: normalizePhase(identity.phase),
    element: identity.element?.trim() || 'Belum diisi',
  };
}

export function resolveModel(requested: string, generated?: string): string {
  if (requested !== 'Auto') return requested;
  if (generated && generated !== 'Auto') return generated;
  return 'Problem Based Learning';
}

function normalizeExperience(value: string, stage: LearningActivityItem['stage']): LearningActivityItem['experience'] {
  const normalized = (value || '').toUpperCase();
  if (normalized.includes('MENGAPLIKASI')) return 'MENGAPLIKASI';
  if (normalized.includes('MEREFLEKSI')) return 'MEREFLEKSI';
  if (normalized.includes('MEMAHAMI')) return 'MEMAHAMI';
  return stage === 'PENUTUP' ? 'MEREFLEKSI' : stage === 'KEGIATAN INTI' ? 'MENGAPLIKASI' : 'MEMAHAMI';
}

function normalizeBadges(values: string[] | undefined): LearningActivityItem['deepLearningBadges'] {
  const text = (values || []).join(' ').toLowerCase();
  return DEEP_LEARNING_BADGES.filter((badge) => {
    const key = badge.toLowerCase();
    if (text.includes(key)) return true;
    if (badge === 'Berkesadaran') return text.includes('mindful');
    if (badge === 'Bermakna') return text.includes('meaningful');
    return text.includes('joyful');
  });
}

function normalizeStage(value: string): LearningActivityItem['stage'] {
  const normalized = (value || '').toUpperCase();
  if (normalized.includes('PENDAHULU')) return 'PENDAHULUAN';
  if (normalized.includes('PENUTUP')) return 'PENUTUP';
  return 'KEGIATAN INTI';
}

export function normalizeLearningObjectives(objectives: string[]): string[] {
  return (objectives || []).map((objective) => (objective || '')
    .replace(/^(?:\s*TP\s*\d+\s*[:.)-]\s*)+/i, '')
    .trim()).filter(Boolean);
}

export function normalizeSuccessCriteria(
  criteria: SuccessCriterion[],
  objectives: string[],
): SuccessCriterion[] {
  return (criteria || []).map((item, index) => {
    const direct = (item.objective || '').toUpperCase().match(/TP\s*([1-9]\d*)/);
    const directIndex = direct ? Number(direct[1]) - 1 : -1;
    const cleanText = (item.objective || '').replace(/^(?:\s*TP\s*\d+\s*[:.)-]\s*)+/i, '').trim().toLowerCase();
    const textIndex = cleanText ? objectives.findIndex((objective) => objective.toLowerCase() === cleanText) : -1;
    const objectiveIndex = directIndex >= 0 && directIndex < objectives.length ? directIndex : textIndex >= 0 ? textIndex : index;
    const normalized = { ...item, objective: `TP${Math.min(Math.max(objectiveIndex, 0), Math.max(objectives.length - 1, 0)) + 1}` };
    const objective = objectives[objectiveIndex] || objectives[index] || '';
    return structureSuccessCriterionEvidence(normalized, inferEvidenceTypeFromObjective(objective));
  }).slice(0, objectives.length || undefined);
}

function normalizeSyntaxText(value: string): string {
  return (value || '').trim();
}

export function normalizeModelSyntaxLabels(items: LearningActivityItem[], resolvedModel: string): LearningActivityItem[] {
  if (/project based|\bpjbl\b/i.test(resolvedModel || '')) {
    return items.map((item) => ({
      ...item,
      syntaxOrPrinciple: normalizeSyntaxText(item.syntaxOrPrinciple)
        .replace(/\bPBL\b/gi, 'PjBL')
        .replace(/\bPJBL\b/gi, 'PjBL'),
    }));
  }
  if (!/problem based|\bpbl\b/i.test(resolvedModel || '')) {
    return items.map((item) => ({ ...item, syntaxOrPrinciple: normalizeSyntaxText(item.syntaxOrPrinciple) }));
  }
  return items.map((item) => {
    const cleaned = normalizeSyntaxText(item.syntaxOrPrinciple);
    const text = cleaned.toLowerCase();
    if (item.stage === 'KEGIATAN INTI') {
      const hasOrient = /orient/.test(text);
      const hasOrganize = /organisasi|mengorganisas|pengorganisas/.test(text);
      if (hasOrient && hasOrganize) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.combined };
      if (hasOrient) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.orient };
      if (hasOrganize) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.organize };
      if (/penyelidik|investigasi/.test(text)) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.investigate };
      if (/karya|menyaj|presentasi/.test(text)) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.present };
      if (/evaluasi|mengevaluasi|analisis.*pemecahan/.test(text)) return { ...item, syntaxOrPrinciple: PBL_SYNTAX.evaluate };
    }
    if (item.stage === 'PENUTUP' && /(sintaks\s*5\s*pbl|evaluasi|mengevaluasi.*pemecahan)/i.test(cleaned)) {
      return { ...item, syntaxOrPrinciple: 'Refleksi, Asesmen, dan Tindak Lanjut' };
    }
    return { ...item, syntaxOrPrinciple: cleaned };
  });
}

export function rebalanceActivityTime(items: LearningActivityItem[], identity: SchoolIdentity): LearningActivityItem[] {
  if (!items.length) return items;
  const meetingCount = Math.max(1, identity.meetingCount || 1);
  const meetingMinutes = identity.jpCount * identity.durationPerJP;
  const normalized = items.map((item, index) => {
    const stage = normalizeStage(String(item.stage || ''));
    return ({
    ...item,
    stage,
    meetingNumber: item.meetingNumber && item.meetingNumber >= 1 && item.meetingNumber <= meetingCount
      ? item.meetingNumber
      : meetingCount === 1 ? 1 : Math.min(meetingCount, Math.floor((index / items.length) * meetingCount) + 1),
    experience: normalizeExperience(String(item.experience || ''), stage),
    deepLearningBadges: normalizeBadges(item.deepLearningBadges as string[] | undefined),
    timeMinutes: Math.max(1, Number(item.timeMinutes) || 1),
  });
  });

  const result: LearningActivityItem[] = [];
  for (let meeting = 1; meeting <= meetingCount; meeting++) {
    const meetingItems = normalized.filter((item) => item.meetingNumber === meeting);
    if (!meetingItems.length) continue;
    let difference = meetingMinutes - meetingItems.reduce((sum, item) => sum + item.timeMinutes, 0);
    const preferred = [...meetingItems.keys()].sort((a, b) => Number(meetingItems[b].stage === 'KEGIATAN INTI') - Number(meetingItems[a].stage === 'KEGIATAN INTI'));
    for (const index of preferred) {
      if (difference === 0) break;
      const current = meetingItems[index].timeMinutes;
      const adjustment = difference > 0 ? difference : Math.max(difference, 1 - current);
      meetingItems[index].timeMinutes += adjustment;
      difference -= adjustment;
    }
    result.push(...meetingItems);
  }
  return result;
}

export function normalizeAssessmentItems(questions: QuizQuestion[], objectives: string[]): QuizQuestion[] {
  let pgCounter = 1;
  let urCounter = 1;
  let prCounter = 1;
  let knCounter = 1;

  return (questions || []).map((question) => {
    let type = question.type;
    if (type === 'Uraian') {
      const taskText = `${question.question} ${question.indicator}`;
      const direct = question.objectiveMeasured?.toUpperCase().match(/TP\s*([1-9]\d*)/);
      const directIndex = direct ? Number(direct[1]) - 1 : -1;
      const objective = directIndex >= 0 && directIndex < objectives.length ? objectives[directIndex] : '';
      const hasMatchingAuthenticObjective = objectives.some((candidate) => AUTHENTIC_ASSESSMENT_PATTERN.test(candidate) && objectiveSimilarityScore(question, candidate) > 0);
      const isAuthenticObjective = AUTHENTIC_ASSESSMENT_PATTERN.test(objective) || hasMatchingAuthenticObjective;
      if (PERFORMANCE_TASK_PATTERN.test(taskText) && isAuthenticObjective) type = 'Kinerja';
      else if (PRODUCT_TASK_PATTERN.test(taskText) && isAuthenticObjective) type = 'Produk';
    }

    let explicitId = question.id;
    if (type === 'PG') explicitId = `PG-${pgCounter++}`;
    else if (type === 'Uraian') explicitId = `UR-${urCounter++}`;
    else if (type === 'Produk') explicitId = `PR-${prCounter++}`;
    else if (type === 'Kinerja') explicitId = `KN-${knCounter++}`;
    else explicitId = `S-${pgCounter++}`;

    return { ...question, type, id: explicitId };
  });
}


export function lockSelectedDimensions(
  selected: SelectedDimension[],
  generated: SelectedDimension[],
): SelectedDimension[] {
  return (selected || []).map((dimension) => {
    const match = (generated || []).find((item) => item.name.trim().toLowerCase() === dimension.name.trim().toLowerCase());
    if (!match) return dimension;
    return {
      name: dimension.name,
      reason: match.reason || dimension.reason,
      indicator: match.indicator || dimension.indicator,
      activity: match.activity || dimension.activity,
      evidence: match.evidence || dimension.evidence,
    };
  });
}

export function completeGraduateRubric(dimensions: SelectedDimension[], rubrics: RubricItem[]): RubricItem[] {
  const result = [...rubrics];
  for (const dimension of dimensions) {
    if (result.some((item) => item.aspect.toLowerCase().includes(dimension.name.toLowerCase()))) continue;
    result.push({ aspect: dimension.name, indicator: dimension.indicator, levels: {
      score1: `Belum menunjukkan ${dimension.indicator.toLowerCase()} tanpa bimbingan.`,
      score2: `Mulai menunjukkan ${dimension.indicator.toLowerCase()} dengan bimbingan.`,
      score3: `Menunjukkan ${dimension.indicator.toLowerCase()} secara konsisten.`,
      score4: `Menunjukkan ${dimension.indicator.toLowerCase()} secara mandiri dan membantu peserta didik lain.`,
    }});
  }
  return result;
}

export function completeProductRubric(rubrics: RubricItem[], activities: LearningActivityItem[], objectives: string[], topic: string): RubricItem[] {
  if (!hasProductActivity(activities, objectives) || rubrics.length) return rubrics;
  const create = (aspect: string, indicator: string): RubricItem => ({ aspect, indicator, levels: {
    score1: 'Belum memenuhi kriteria dasar.', score2: 'Memenuhi sebagian kriteria dengan beberapa kekeliruan.',
    score3: 'Memenuhi kriteria dengan tepat dan jelas.', score4: 'Melampaui kriteria dengan kualitas sangat kuat dan konsisten.',
  }});
  return [
    create('Ketepatan Konten', `Isi produk akurat dan selaras dengan materi ${topic}.`),
    create('Kesesuaian Tujuan', 'Produk menunjukkan ketercapaian tujuan pembelajaran yang ditetapkan.'),
    create('Kreativitas', 'Produk menyajikan gagasan atau solusi secara menarik dan relevan.'),
    create('Kejelasan Komunikasi', 'Pesan produk mudah dipahami, runtut, dan sesuai audiens.'),
  ];
}

export function ensureReflections(items: string[], enabled: boolean, kind: 'student' | 'teacher'): string[] {
  if (!enabled) return [];
  const defaults = kind === 'student'
    ? ['Bagian apa yang masih paling sulit dipahami?', 'Strategi belajar apa yang paling membantu?', 'Keterampilan baru apa yang kamu latih?', 'Bagaimana materi ini berkaitan dengan kehidupan sehari-hari?', 'Apa yang akan kamu perbaiki pada pembelajaran berikutnya?']
    : ['Apakah seluruh tujuan pembelajaran tercapai?', 'Miskonsepsi apa yang masih muncul?', 'Apakah dukungan guru yang diberikan sudah membantu peserta didik?', 'Apakah alokasi waktu sesuai kebutuhan kegiatan?', 'Apa tindak lanjut yang perlu dilakukan pada pertemuan berikutnya?'];
  return [...items, ...defaults].filter((item, index, array) => item && array.indexOf(item) === index).slice(0, Math.max(5, items.length));
}
