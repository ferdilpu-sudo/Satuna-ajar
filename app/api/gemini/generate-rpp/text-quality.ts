const HIGH_CONFIDENCE_CORRECTIONS: Array<[RegExp, string]> = [
  [/\bApersDynamic\b/gi, 'Apersepsi'],
  [/\bKelaborasi\b/gi, 'Kolaborasi'],
  [/\bobyektif\b/gi, 'objektif'],
  [/\boriginalitas\b/gi, 'orisinalitas'],
  [/\boriginal\b/gi, 'orisinal'],
  [/\bHighly\s+orisinal\b/gi, 'sangat orisinal'],
  [/\bWhatsapp\b/gi, 'WhatsApp'],
  [/\bYoutube\b/gi, 'YouTube'],
  [/\bmengkonstruksi\b/gi, 'mengonstruksi'],
  [/\bhomeostasis(?:\s+ekosistem)?\b/gi, 'keseimbangan ekosistem'],
  [/\btrophic\s+cascade\b/gi, 'dampak berantai dalam rantai makanan'],
  [/\bkeystone\s+species\b/gi, 'spesies kunci'],
  [/\bmicroplastics?\b/gi, 'mikroplastik'],
  [/\bblooming\s+alga\b/gi, 'ledakan alga'],
  [/\bblooming\s+eceng\s+gondok\b/gi, 'pertumbuhan eceng gondok berlebihan'],
  [/\bsaintifik\b/gi, 'ilmiah'],
  [/\bkomprehensif\b/gi, 'menyeluruh'],
  [/\bmenginvestigasi\b/gi, 'menyelidiki'],
  [/\binvestigasi\b/gi, 'penyelidikan'],
  [/\bsolusi\s+kontekstual\b/gi, 'solusi yang sesuai dengan kondisi setempat'],
  [/\bgagasan\s+kontekstual\b/gi, 'gagasan yang sesuai dengan kondisi setempat'],
  [/\bsolusi\s+solutif\b/gi, 'solusi yang dapat diterapkan'],
  [/\bgagasan\s+solutif\b/gi, 'gagasan yang dapat diterapkan'],
  [/\bmemfasilitasi\b/gi, 'membantu'],
  [/\bkerealistisan\b/gi, 'kelayakan'],
  [/\bhukum\s+(?:transfer|perpindahan|efisiensi)\s+energi\s+(?:sekitar\s+)?10\s*(?:persen|%)/gi, 'prinsip perpindahan energi sekitar 10%'],
  [/\b(?:hukum|aturan|kaidah)\s+10\s*(?:persen|%)/gi, 'prinsip perpindahan energi sekitar 10%'],
  [/\bkaidah\s+efisiensi\s+transfer\s+energi\s+(?:sekitar\s+)?10\s*(?:persen|%)/gi, 'prinsip perpindahan energi sekitar 10%'],
  [/\befisiensi\s+transfer\s+energi\s+(?:sebesar\s+)?10\s*(?:persen|%)/gi, 'perpindahan energi sekitar 10%'],
  [/\bsekitar\s+10\s+persen\b/gi, 'sekitar 10%'],
  [/\blimbah\s+limbah\b/gi, 'limbah'],
  [/\blimbah\s+domestik\s+tangga\b/gi, 'limbah rumah tangga'],
  [/\bketerseimbangan\b/gi, 'keseimbangan'],
  [/\bkeberlangsung\s+daur\b/gi, 'keberlangsungan daur'],
  [/\benceng\s+gondok\b/gi, 'eceng gondok'],
  [/\bmipsepsi\b/gi, 'miskonsepsi'],
  [/\bmengitung\b/gi, 'menghitung'],
  [/\bamat\s+visual\s+informatif\b/gi, 'sangat informatif secara visual'],
  [/\bpenurunan\s+energi\s+sekitar\s+10%\s+pada\s+setiap\s+(?:tingkatan|tingkat)\b/gi, 'sekitar 10% energi diteruskan ke tingkat trofik berikutnya'],
  [/\benergi\s+(?:menurun|berkurang)\s+sekitar\s+10%\s+pada\s+setiap\s+(?:tingkatan|tingkat)\b/gi, 'sekitar 10% energi diteruskan ke tingkat trofik berikutnya'],
  [/\b(kerusakan|hilangnya|berkurangnya)\s+vegetasi\s+menolak\s+penyerapan\b/gi, '$1 vegetasi menurunkan penyerapan'],
  [/\b([A-Za-zÀ-ÿ]{3,})\s+\1\b/gi, '$1'],
  [/\b(kelompok\s+(?:kecil|heterogen)?)\s*\(\s*\d+[\s–-]+\d+\s*(?:orang|peserta\s+didik|siswa)?\s*\)/gi, '$1'],
  [/\b(beranggotakan|terdiri\s+(?:dari|atas))\s+\d+[\s–-]+\d+\s*(?:orang|peserta\s+didik|siswa)\b/gi, '$1 beberapa peserta didik'],
  [/\b(\d+[\s–-]+\d+)\s*(?:orang|peserta\s+didik|siswa)\s+per\s+kelompok\b/gi, 'beberapa peserta didik per kelompok'],
];

export function normalizeGeneratedText(value: string): string {
  return HIGH_CONFIDENCE_CORRECTIONS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
}

/**
 * Applies only high-confidence wording/spelling repairs to AI-generated text.
 * User identity/input is intentionally not passed through this function.
 */
export function cleanGeneratedTextFields<T>(value: T): T {
  if (typeof value === 'string') return normalizeGeneratedText(value) as T;
  if (Array.isArray(value)) return value.map((item) => cleanGeneratedTextFields(item)) as T;
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, cleanGeneratedTextFields(item)]),
  ) as T;
}
