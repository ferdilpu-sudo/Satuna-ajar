import type { LearningSettings, MaterialAnalysis, OutputConfig, SchoolIdentity, SelectedDimension } from '../../../../types/rpp';
import type { PedagogicalPlan } from '../../../../types/pedagogy';
import { formatPhase } from '../../../../lib/validation';
import { getTemplateSyntaxSteps } from '../../../../lib/templates';
import { HUMAN_LANGUAGE_RULES } from './human-language';

export interface PromptInput {
  materialAnalysis: MaterialAnalysis;
  identity: SchoolIdentity;
  settings: LearningSettings;
  selectedDimensions: SelectedDimension[];
  outputConfig: OutputConfig;
  totalMinutes: number;
  sourceFiles: string[];
  pedagogicalPlan: PedagogicalPlan;
}

function documentRules(output: OutputConfig): string {
  if (output.format === 'Ringkas') {
    return `FORMAT RPP RINGKAS:\n- Fokus hanya pada TP & KKTP, langkah pembelajaran, rencana asesmen, instrumen sumatif, dan pemetaan TP.\n- Diagnostik ringkas harus berisi tepat 2 pertanyaan KOGNITIF tentang kesiapan/prasyarat materi; kosongkan diagnosticNonCognitive.\n- Isi facilities.learningSources dengan 2-4 SARAN SUMBER BELAJAR non-URL yang realistis dan relevan. Gunakan kategori generik yang aman, misalnya buku teks yang digunakan sekolah, materi pendukung guru, lingkungan sekitar, atau media pembelajaran yang sesuai topik. Jangan mengarang judul buku, penerbit, penulis, atau URL spesifik.\n- Jangan memperluas menjadi Modul Ajar. Jangan membuat DPL detail, LKPD lengkap, remedial/pengayaan, atau refleksi terpisah.`;
  }
  return `FORMAT MODUL AJAR LENGKAP:\n- Kembangkan blueprint menjadi DPL, model/metode, lingkungan/digital, materi esensial, asesmen, rubrik, refleksi, remedial/pengayaan, dan LKPD sesuai opsi pengguna.\n- Setiap bagian tambahan harus tetap mengacu ke TP dan assessment blueprint; jangan membuat tujuan baru.\n- Buat tepat 4 pertanyaan diagnostik KOGNITIF yang mengukur kesiapan/prasyarat materi, lengkap dengan kriteria/jawaban yang diharapkan; kosongkan diagnosticNonCognitive kecuali benar-benar dibutuhkan.\n- Hormati scopeFeasibility pada blueprint. Jangan menambahkan subkompetensi, produk, investigasi, atau aktivitas besar di luar TP hanya untuk mencakup seluruh CP.
- summativeQuestions adalah BANK INSTRUMEN lengkap. Jangan menulis seolah seluruh 5 PG + 3 uraian wajib dikerjakan pada satu sesi penutup; aplikasi akan memilih subset soal yang realistis sesuai waktu pertemuan.`;
}

export function buildSystemInstruction(input: PromptInput): string {
  const dimensions = input.selectedDimensions.map((item) => item.name).join(', ');
  const meetingMinutes = input.identity.jpCount * input.identity.durationPerJP;
  const templateSyntax = getTemplateSyntaxSteps(input.pedagogicalPlan.resolvedModel);
  const templateSyntaxRule = templateSyntax.length
    ? `\n7a. Untuk model ${input.pedagogicalPlan.resolvedModel}, gunakan urutan inti berikut pada KEGIATAN INTI dan jangan mencampurkannya dengan tipe Cooperative Learning lain: ${templateSyntax.map((step, index) => `${index + 1}) ${step}`).join(' → ')}.`
    : '';
  return `Anda adalah pakar Kurikulum Merdeka dan Pembelajaran Mendalam. Tugas Anda MENULIS dokumen dari BLUEPRINT PEDAGOGIS yang sudah divalidasi aplikasi. Blueprint adalah kontrak; jangan merancang ulang TP atau pemetaan kompetensi.

ATURAN WAJIB:
1. Identitas adalah DATA TERKUNCI. Jangan mengubah guru, sekolah, kelas, fase, elemen, CP, topik, atau sumber. Jika Elemen = "Belum diisi", pertahankan dan jangan mengarang elemen.
2. learningObjectives harus sama makna dan urutannya dengan objective pada BLUEPRINT. Gunakan ref TP1, TP2, dst sesuai blueprint.
3. assessmentBlueprint menentukan evidence utama setiap TP. TP PRODUCT/PERFORMANCE tidak boleh dipaksa menjadi tes tertulis. Soal tertulis yang tidak mengukur kompetensi utama jangan dipetakan ke TP tersebut; gunakan UNMAPPED.
4. Fakta spesifik (tanggal/tahun, angka, regulasi, pasal, sanksi, tokoh, lokasi) hanya boleh berasal dari Fakta Utama/teks sumber atau riset web ter-grounding yang diberikan. Jangan menambah detail dari ingatan model.
5. facilities.learningSources adalah SARAN SUMBER BELAJAR, bukan daftar sumber riset. Jangan menulis URL baru. Link riset web akan dipasang aplikasi hanya dari groundingMetadata.
6. Jika materi hukum/regulasi, gunakan framing "Berdasarkan materi sumber yang digunakan..." dan jangan menyatakan status hukum terkini tanpa sumber grounding.
7. Model pembelajaran harus mengikuti BLUEPRINT (${input.pedagogicalPlan.resolvedModel}). Gunakan singkatan PBL hanya untuk Problem Based Learning dan PjBL untuk Project Based Learning. Untuk Cooperative Learning, tulis tipe yang dipilih (Jigsaw atau STAD) secara konsisten. Tahap model hanya ditempatkan pada KEGIATAN INTI; pendahuluan/penutup bukan bagian dari tahap inti model.${templateSyntaxRule}
8. Waktu: ${input.identity.meetingCount} pertemuan × ${meetingMinutes} menit; total ${input.totalMinutes} menit. Total tiap pertemuan wajib tepat. Jangan mengarang jumlah peserta didik atau ukuran kelompok numerik; gunakan "kelompok kecil/heterogen".
9. experience hanya MEMAHAMI, MENGAPLIKASI, MEREFLEKSI. deepLearningBadges hanya Berkesadaran, Bermakna, Menggembirakan.
10. Setiap dimensi terpilih (${dimensions}) yang diminta format harus memiliki indikator, aktivitas, bukti, dan rubrik 4 level.
11. Jika ada produk dan rubrik diaktifkan, productRubric minimal: Ketepatan Konten, Kesesuaian Tujuan, Kreativitas, Kejelasan Komunikasi.
12. Buat tepat ${input.outputConfig.pgCount} PG dan ${input.outputConfig.essayCount} uraian mengikuti assessmentItems pada BLUEPRINT. ID, type, objectiveRef, role, competency, dan contentFocus adalah kontrak. Tuntutan kognitif harus tampak pada STEM PERTANYAAN (bukan hanya ditulis di indikator), objectiveMeasured harus persis objectiveRef, dan soal tidak boleh bergeser dari contentFocus slot terkait.
13. Asesmen memuat diagnostik, formatif, sumatif. Instrumen yang disebut harus konkret dan dapat digunakan guru.
14. Bahasa Indonesia baku, konsisten memakai "peserta didik". Hindari duplikasi kata dan istilah campuran/nonbaku.
15. Untuk efisiensi transfer energi, gunakan frasa "sekitar 10%" sebagai prinsip umum bila memang ada di materi; jangan mengarang persentase alternatif (mis. 5%, 20%) kecuali angka itu tersedia di materi sumber sebagai data soal.
16. Untuk Modul Ajar, empat pertanyaan diagnostik adalah instrumen yang benar-benar digunakan pada awal pembelajaran. Sisakan ruang waktu yang realistis untuk diagnostik, asesmen sumatif terpilih, refleksi, dan penutupan.
17. ${HUMAN_LANGUAGE_RULES}

${documentRules(input.outputConfig)}`;
}

export function buildUserPrompt(input: PromptInput): string {
  const { identity, materialAnalysis, settings, outputConfig, pedagogicalPlan } = input;
  return `Buat ${outputConfig.format === 'Ringkas' ? 'RPP Ringkas' : 'Modul Ajar Lengkap'} berdasarkan kontrak berikut.

BLUEPRINT PEDAGOGIS TERKUNCI:
${JSON.stringify(pedagogicalPlan, null, 2)}

IDENTITAS TERKUNCI:
- Penyusun/Sekolah/Tahun: ${identity.teacherName || 'Belum diisi'} / ${identity.schoolName || 'Belum diisi'} / ${identity.academicYear || 'Belum diisi'}
- Jenjang/Mapel: ${identity.educationLevel} / ${identity.subject}
- Kelas/Fase/Semester: ${identity.grade} / ${formatPhase(identity.phase)} / ${identity.semester}
- Elemen: ${identity.element || 'Belum diisi'}
- Topik/Subtopik: ${identity.topic} / ${identity.subtopic || 'Belum diisi'}
- Waktu: ${identity.meetingCount} × (${identity.jpCount} JP × ${identity.durationPerJP} menit), total ${input.totalMinutes} menit
- CP (${identity.cpSource}): ${identity.learningOutcomes}

MATERI SUMBER:
- Judul/Subtopik: ${materialAnalysis.title} / ${materialAnalysis.subtopics.join(', ')}
- Konsep: ${materialAnalysis.coreConcepts.join(', ')}
- Istilah: ${materialAnalysis.keyTerms.join(', ')}
- Fakta yang boleh dipakai: ${materialAnalysis.keyFacts.join(' | ') || 'Tidak ada fakta spesifik'}
- Keterampilan: ${materialAnalysis.targetSkills.join(', ')}
- Konteks: ${materialAnalysis.authenticContext}
- Potensi Produk: ${materialAnalysis.potentialProducts.join(', ')}
${materialAnalysis.rawTextContext ? `- Teks sumber pendukung:\n${materialAnalysis.rawTextContext.slice(0, 12000)}` : ''}
${materialAnalysis.webSources?.length ? `- SUMBER RISET WEB TER-GROUNDING (jangan ubah URL):\n${materialAnalysis.webSources.map((source, index) => `  ${index + 1}. ${source.title} — ${source.url}`).join('\n')}` : '- Sumber Riset Web: Tidak digunakan'}

PENGATURAN USER:
- Metode: ${settings.methods.join(', ')}
- Mitra: ${settings.partners.join(', ')}
- Digital: ${settings.digitalTools.join(', ')}
- Jika PID (Papan Interaktif Digital) dipilih, perlakukan sebagai papan/layar interaktif kelas untuk menampilkan media, memberi anotasi, interaksi kolaboratif, atau asesmen formatif yang relevan; jangan mengubah PID menjadi nama aplikasi lain.
- Dimensi: ${JSON.stringify(input.selectedDimensions)}
- Opsi: LKPD=${outputConfig.includeLKPD}; Rubrik=${outputConfig.includeRubrics}; Remedial/Pengayaan=${outputConfig.includeRemedialEnrichment}; Refleksi Siswa=${outputConfig.includeStudentReflection}; Refleksi Guru=${outputConfig.includeTeacherReflection}

Kembalikan JSON sesuai schema format dokumen.`;
}
