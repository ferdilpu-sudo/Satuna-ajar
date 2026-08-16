import type { RPPTemplate } from '../types/rpp';

export const TEMPLATE_LIST: RPPTemplate[] = [
  {
    id: 'tpl_pbl',
    name: 'Problem Based Learning (PBL)',
    model: 'Problem Based Learning',
    description: 'Cocok untuk materi berorientasi pemecahan masalah nyata, isu lingkungan, kasus sosial, dan analisis fenomena.',
    suitableSubjects: ['IPA', 'IPS', 'PPKn', 'Bahasa Indonesia', 'Biologi', 'Sosiologi'],
    syntaxSteps: [
      'Mengorientasikan peserta didik pada masalah',
      'Mengorganisasikan peserta didik untuk belajar',
      'Membimbing penyelidikan individu/kelompok',
      'Mengembangkan dan menyajikan hasil karya',
      'Menganalisis dan mengevaluasi proses pemecahan masalah',
    ],
  },
  {
    id: 'tpl_pjbl',
    name: 'Project Based Learning (PjBL)',
    model: 'Project Based Learning',
    description: 'Cocok untuk materi yang menghasilkan produk nyata seperti prototipe, karya, atau media kampanye.',
    suitableSubjects: ['Informatika', 'Seni Budaya', 'Prakarya', 'Fisika', 'Bahasa Inggris'],
    syntaxSteps: [
      'Pertanyaan mendasar',
      'Mendesain perencanaan proyek',
      'Menyusun jadwal pembuatan',
      'Memonitor keaktifan dan perkembangan proyek',
      'Menguji hasil',
      'Evaluasi pengalaman belajar',
    ],
  },
  {
    id: 'tpl_inquiry',
    name: 'Inquiry Learning (Inkuiri)',
    model: 'Inquiry Learning',
    description: 'Cocok untuk eksplorasi, eksperimen, dan penemuan konsep melalui pengamatan atau data.',
    suitableSubjects: ['Matematika', 'Fisika', 'Kimia', 'IPA SD/SMP'],
    syntaxSteps: [
      'Orientasi',
      'Merumuskan masalah',
      'Merumuskan hipotesis',
      'Mengumpulkan data',
      'Menguji hipotesis',
      'Merumuskan kesimpulan',
    ],
  },
  {
    id: 'tpl_jigsaw',
    name: 'Cooperative Learning - Jigsaw',
    model: 'Cooperative Learning - Jigsaw',
    description: 'Cocok untuk materi yang dapat dibagi menjadi beberapa subtopik dan dipelajari melalui kegiatan saling mengajar antaranggota kelompok.',
    suitableSubjects: ['Sejarah', 'Bahasa Indonesia', 'PPKn', 'IPS', 'Biologi', 'Geografi'],
    syntaxSteps: [
      'Menyampaikan tujuan dan membentuk kelompok asal',
      'Membagi bagian materi atau tugas kepada setiap anggota',
      'Belajar dan berdiskusi dalam kelompok ahli',
      'Kembali ke kelompok asal dan saling mengajarkan',
      'Menyajikan hasil dan mengklarifikasi pemahaman',
      'Evaluasi individu dan refleksi kelompok',
    ],
  },
  {
    id: 'tpl_stad',
    name: 'Cooperative Learning - STAD',
    model: 'Cooperative Learning - STAD',
    description: 'Cocok untuk penguatan konsep atau keterampilan melalui belajar dalam tim, latihan bersama, dan penilaian individual.',
    suitableSubjects: ['Matematika', 'IPA', 'Bahasa Inggris', 'Ekonomi', 'Informatika'],
    syntaxSteps: [
      'Menyampaikan tujuan dan memotivasi peserta didik',
      'Menyajikan materi atau informasi awal',
      'Membentuk tim belajar heterogen',
      'Belajar dan berlatih bersama tim',
      'Melaksanakan kuis atau penilaian individual',
      'Menghitung perkembangan individu dan memberikan penghargaan tim',
    ],
  },
];

export function getTemplateSyntaxSteps(model: string): string[] {
  return TEMPLATE_LIST.find((template) => template.model === model)?.syntaxSteps ?? [];
}
