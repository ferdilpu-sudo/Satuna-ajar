export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

const ROMAN_TO_NUMBER: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

const GRADE_ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII',
};

export function parseGradeNumber(grade: string): number | null {
  const normalized = (grade || '').trim().toUpperCase().replace(/^KELAS\s+/, '').trim();
  if (!normalized) return null;
  const numeric = normalized.match(/^([1-9]|1[0-2])$/);
  if (numeric) return Number(numeric[1]);
  const roman = normalized.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/);
  return roman ? ROMAN_TO_NUMBER[roman[1]] : null;
}

export function normalizeGrade(grade: string): string {
  const number = parseGradeNumber(grade);
  return number ? `Kelas ${GRADE_ROMAN[number]}` : (grade || '').trim();
}

export function normalizePhase(phase: string): string {
  const match = (phase || '').trim().toUpperCase().match(/(?:FASE\s*)?([A-F])\b/);
  return match?.[1] || (phase || '').trim().toUpperCase();
}

export function formatPhase(phase: string): string {
  const normalized = normalizePhase(phase);
  return normalized ? `Fase ${normalized}` : 'Fase -';
}

export function normalizeEducationLevel(level: string): string {
  const normalized = (level || '').trim().toUpperCase();
  if (!normalized) return '';
  if (normalized.includes('SD') || normalized === 'MI' || normalized.includes('MADRASAH IBTIDAIYAH')) return 'SD/MI';
  if (normalized.includes('SMP') || normalized.includes('MTS') || normalized.includes('TSANAWIYAH')) return 'SMP/MTs';
  if (normalized.includes('SMK') || normalized.includes('MAK')) return 'SMK/MAK';
  if (normalized.includes('SMA') || normalized === 'MA' || normalized.includes('ALIYAH')) return 'SMA/MA';
  return level.trim();
}

export function expectedPhaseForGrade(grade: string): string | null {
  const gradeNumber = parseGradeNumber(grade);
  if (!gradeNumber) return null;
  if (gradeNumber <= 2) return 'A';
  if (gradeNumber <= 4) return 'B';
  if (gradeNumber <= 6) return 'C';
  if (gradeNumber <= 9) return 'D';
  if (gradeNumber === 10) return 'E';
  return 'F';
}

export function validateGradeLevelPhase(level: string, grade: string, phase: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const normalizedLevel = normalizeEducationLevel(level);
  const gradeNumber = parseGradeNumber(grade);
  const normalizedPhase = normalizePhase(phase);

  if (!gradeNumber) {
    issues.push({ field: 'grade', message: 'Kelas belum valid atau belum diisi.', severity: 'error' });
    return issues;
  }

  const validRange =
    normalizedLevel === 'SD/MI' ? [1, 6] :
    normalizedLevel === 'SMP/MTs' ? [7, 9] :
    normalizedLevel === 'SMA/MA' || normalizedLevel === 'SMK/MAK' ? [10, 12] : null;

  if (!validRange) {
    issues.push({ field: 'educationLevel', message: 'Jenjang pendidikan belum dipilih.', severity: 'error' });
  } else if (gradeNumber < validRange[0] || gradeNumber > validRange[1]) {
    issues.push({
      field: 'grade',
      message: `Jenjang ${normalizedLevel} tidak sesuai dengan ${normalizeGrade(grade)}.`,
      severity: 'error',
    });
  }

  const expectedPhase = expectedPhaseForGrade(grade);
  if (!normalizedPhase) {
    issues.push({ field: 'phase', message: 'Fase belum dipilih.', severity: 'error' });
  } else if (expectedPhase && normalizedPhase !== expectedPhase) {
    issues.push({
      field: 'phase',
      message: `${normalizeGrade(grade)} seharusnya menggunakan Fase ${expectedPhase}, bukan Fase ${normalizedPhase}.`,
      severity: 'error',
    });
  }

  return issues;
}

const ELEMENT_GENERIC_WORDS = new Set(['pemahaman', 'konsep', 'keterampilan', 'proses', 'elemen', 'dan']);

export function validateElementLooksLikeTopic(element: string, topic: string): { looksLikeTopic: boolean; reason?: string } {
  const tokens = (value: string) => value.toLowerCase().split(/[^a-z0-9À-ÿ]+/i)
    .filter((word) => word.length > 3 && !ELEMENT_GENERIC_WORDS.has(word));
  const elementTokens = tokens(element || '');
  if (elementTokens.length < 2 || !topic?.trim()) return { looksLikeTopic: false };
  const topicTokens = new Set(tokens(topic));
  const overlap = elementTokens.filter((word) => topicTokens.has(word)).length / elementTokens.length;
  if (overlap < 0.6) return { looksLikeTopic: false };
  return {
    looksLikeTopic: true,
    reason: `Elemen '${element}' tampak seperti nama topik/subtopik. Pastikan Elemen diisi dengan nomenklatur elemen kurikulum; jika belum diketahui, kosongkan agar menjadi 'Belum diisi'.`,
  };
}

export interface SubjectElementMapping {
  keywords: RegExp;
  defaultElement: string;
  options: string[];
}

export const SUBJECT_ELEMENT_MAP: SubjectElementMapping[] = [
  {
    keywords: /^(ipa|ilmu pengetahuan alam|natural science|ipaba)/i,
    defaultElement: 'Pemahaman IPA & Keterampilan Proses',
    options: ['Pemahaman IPA', 'Keterampilan Proses'],
  },
  {
    keywords: /^(ips|ilmu pengetahuan sosial|social science)/i,
    defaultElement: 'Pemahaman Konsep & Keterampilan Proses',
    options: ['Pemahaman Konsep', 'Keterampilan Proses'],
  },
  {
    keywords: /^(matematika|math|mtk)/i,
    defaultElement: 'Bilangan, Aljabar, Pengukuran, Geometri, Data & Peluang',
    options: ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data dan Peluang'],
  },
  {
    keywords: /^(bahasa indonesia|indonesia|b\.?\s*indo)/i,
    defaultElement: 'Menyimak, Membaca-Memirsa, Berbicara-Mempresentasikan, Menulis',
    options: ['Menyimak', 'Membaca dan Memirsa', 'Berbicara dan Mempresentasikan', 'Menulis'],
  },
  {
    keywords: /^(bahasa inggris|english|b\.?\s*inggris)/i,
    defaultElement: 'Menyimak-Berbicara, Membaca-Memirsa, Menulis-Mempresentasikan',
    options: ['Menyimak - Berbicara', 'Membaca - Memirsa', 'Menulis - Mempresentasikan'],
  },
  {
    keywords: /^(pendidikan pancasila|pancasila|ppkn|pkn)/i,
    defaultElement: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika, NKRI',
    options: ['Pancasila', 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945', 'Bhinneka Tunggal Ika', 'Negara Kesatuan Republik Indonesia'],
  },
  {
    keywords: /^(informatika|tik|komputer|koding)/i,
    defaultElement: 'Berpikir Komputasional, TIK, SK, JKI, AD, AP, DSI, PLB',
    options: ['Berpikir Komputasional (BK)', 'Teknologi Informasi dan Komunikasi (TIK)', 'Sistem Komputer (SK)', 'Jaringan Komputer dan Internet (JKI)', 'Analisis Data (AD)', 'Algoritma dan Pemrograman (AP)', 'Dampak Sosial Informatika (DSI)', 'Praktik Lintas Bidang (PLB)'],
  },
  {
    keywords: /^(pendidikan agama|agama islam|pai|pabp)/i,
    defaultElement: 'Al-Qur\'an Hadis, Akidah, Akhlak, Fikih, Sejarah Peradaban Islam',
    options: ['Al-Qur\'an dan Hadis', 'Akidah', 'Akhlak', 'Fikih', 'Sejarah Peradaban Islam'],
  },
  {
    keywords: /^(fisika)/i,
    defaultElement: 'Pemahaman Fisika & Keterampilan Proses',
    options: ['Pemahaman Fisika', 'Keterampilan Proses'],
  },
  {
    keywords: /^(kimia)/i,
    defaultElement: 'Pemahaman Kimia & Keterampilan Proses',
    options: ['Pemahaman Kimia', 'Keterampilan Proses'],
  },
  {
    keywords: /^(biologi)/i,
    defaultElement: 'Pemahaman Biologi & Keterampilan Proses',
    options: ['Pemahaman Biologi', 'Keterampilan Proses'],
  },
  {
    keywords: /^(sejarah)/i,
    defaultElement: 'Pemahaman Konsep Sejarah & Keterampilan Proses',
    options: ['Pemahaman Konsep Sejarah', 'Keterampilan Proses Sejarah'],
  },
  {
    keywords: /^(geografi)/i,
    defaultElement: 'Pemahaman Konsep Geografi & Keterampilan Proses',
    options: ['Pemahaman Konsep Geografi', 'Keterampilan Proses Geografi'],
  },
  {
    keywords: /^(sosiologi)/i,
    defaultElement: 'Pemahaman Konsep Sosiologi & Keterampilan Proses',
    options: ['Pemahaman Konsep Sosiologi', 'Keterampilan Proses Sosiologi'],
  },
  {
    keywords: /^(ekonomi)/i,
    defaultElement: 'Pemahaman Konsep Ekonomi & Keterampilan Proses',
    options: ['Pemahaman Konsep Ekonomi', 'Keterampilan Proses Ekonomi'],
  },
  {
    keywords: /^(pjok|pendidikan jasmani|penjas|olahraga)/i,
    defaultElement: 'Terampil Bergerak, Belajar melalui Gerak, Bergaya Hidup Aktif',
    options: ['Terampil Bergerak', 'Belajar melalui Gerak', 'Bergaya Hidup Aktif', 'Memilih Hidup yang Sehat'],
  },
  {
    keywords: /^(seni|seni rupa|seni musik|seni tari|seni teater|seni budaya)/i,
    defaultElement: 'Mengalami, Menciptakan, Merefleksikan, Berpikir & Bekerja Artistik',
    options: ['Mengalami (Experiencing)', 'Menciptakan (Creating)', 'Merefleksikan (Reflecting)', 'Berpikir dan Bekerja Artistik', 'Berdampak (Impacting)'],
  },
  {
    keywords: /^(prakarya|pkwu|kewirausahaan)/i,
    defaultElement: 'Observasi dan Eksplorasi, Desain, Produksi, Refleksi',
    options: ['Observasi dan Eksplorasi', 'Desain/Perancangan', 'Produksi', 'Refleksi dan Evaluasi'],
  },
  {
    keywords: /^(bimbingan konseling|bk)/i,
    defaultElement: 'Layanan Pribadi, Sosial, Belajar, Karir',
    options: ['Layanan Pribadi', 'Layanan Sosial', 'Layanan Belajar', 'Layanan Karir'],
  },
];

export function getSuggestedElementsForSubject(subject: string): { defaultElement: string; options: string[] } | null {
  const cleanSubject = (subject || '').trim();
  if (!cleanSubject) return null;
  const match = SUBJECT_ELEMENT_MAP.find((item) => item.keywords.test(cleanSubject));
  if (match) {
    return { defaultElement: match.defaultElement, options: match.options };
  }
  return null;
}

const SUBJECT_ELEMENT_MISMATCHES = [
  { subject: /ips|sosial|ekonomi|sejarah|geografi|sosiologi/i, element: /pemahaman\s+ipa|keterampilan\s+proses\s+ipa/i },
  { subject: /ipa|biologi|fisika|kimia/i, element: /pemahaman\s+ips|keterampilan\s+sosial/i },
];

export function validateElementSubjectAlignment(subject: string, element: string): { isAligned: boolean; reason?: string } {
  const cleanElement = (element || '').trim();
  if (!cleanElement || cleanElement.toLowerCase() === 'belum diisi') return { isAligned: true };
  const mismatch = SUBJECT_ELEMENT_MISMATCHES.find(
    (rule) => rule.subject.test(subject || '') && rule.element.test(cleanElement),
  );
  return mismatch
    ? { isAligned: false, reason: `Elemen '${cleanElement}' tidak selaras dengan mata pelajaran '${subject}'.` }
    : { isAligned: true };
}
