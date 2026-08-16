import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import { generateContentWithRetry } from "@/lib/gemini";
import { Type } from "@google/genai";
import { extractWebGrounding } from "@/lib/gemini-grounding";
import { extractUrlsFromText } from "@/lib/export/source-section";
import { normalizeEducationLevel, normalizeGrade, normalizePhase } from "@/lib/validation";
import { checkIpRateLimit, rateLimitResponse } from '@/lib/server/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkIpRateLimit(req, 'analyze-material', 30);
    if (rateLimit && !rateLimit.allowed) return rateLimitResponse(rateLimit);
    const body = await req.json();
    const { typedText, fileData, notes, useWebResearch = true, identityContext } = body;
    const webResearchEnabled = Boolean(useWebResearch);

    let parts: any[] = [];

    // System instruction for pedagogical material analysis
    const systemInstruction = `Anda adalah pakar kurikulum Kurikulum Merdeka dan Pembelajaran Mendalam (Deep Learning).
Tugas Anda adalah menganalisis materi pembelajaran yang diberikan pengguna secara mendalam.
JANGAN HANYA MEMBACA JUDUL. Baca seluruh teks atau dokumen.
Ekstrak konsep utama, fakta kunci, subtopik, keterampilan sasaran, dan konteks autentik nyata untuk RPP Pembelajaran Mendalam. Jika materi luas, hasilkan beberapa subtopik yang bersama-sama mewakili keseluruhan ruang lingkup, bukan hanya subtopik pertama.
Selalu buat DRAFT Capaian Pembelajaran berbasis materi pada field generatedCP bila CP tidak tersurat jelas. Draft ini BUKAN CP resmi dan harus diverifikasi guru terhadap dokumen kurikulum resmi. Isi generatedCP HANYA rumusan CP-nya; jangan menambahkan awalan seperti "Draft AI", "Draft saran AI", disclaimer, atau catatan verifikasi ke dalam teks CP.
Selalu isi generatedElement dengan elemen pembelajaran yang paling relevan terhadap mata pelajaran, fase, dan materi target. Ini adalah saran AI, bukan klaim elemen resmi. Jika elemen tersurat di dokumen, salin apa adanya ke detectedElement.

DETEKSI INFORMASI SASARAN DARI DOKUMEN/NAMA FILE:
Periksa secara cermat apakah nama file atau isi dokumen secara eksplisit atau implisit menyebutkan:
- Jenjang (SD/MI, SMP/MTs, SMA/MA, SMK/MAK)
- Kelas (misal Kelas IX, Kelas VII, Kelas X)
- Fase (Fase A, B, C, D, E, F)
- Mata Pelajaran (misal IPS, IPA, Matematika, Bahasa Indonesia)
- Elemen pembelajaran jika dicantumkan secara tertulis dalam dokumen.
- Capaian Pembelajaran (CP) jika dicantumkan secara tertulis dalam dokumen.
Jika ditemukan, sertakan dalam field detectedLevel, detectedGrade, detectedPhase, detectedSubject, detectedElement, detectedCP.

DETEKSI KONTEN SENSITIF/REGULASI (sensitiveContentType):
- Jika materi memuat undang-undang, pasal, sanksi hukum, atau peraturan pemerintah, set sensitiveContentType: "LAW" dan sensitiveWarningNote: "Materi memuat regulasi/peraturan. Verifikasi status regulasi terbaru pada sumber resmi sebelum digunakan."
- Jika tidak ada, set sensitiveContentType: "NONE".

RISET WEB:
- Jika alat Google Search tersedia, gunakan hanya untuk MELENGKAPI atau memverifikasi fakta yang relevan dengan topik pengguna.
- Prioritaskan sumber primer/resmi: Kemendikdasmen, JDIH/BPK, kementerian/lembaga pemerintah, BI/OJK/BPS, universitas/lembaga pendidikan, lalu institusi tepercaya lain.
- Hindari blog/agregator bila sumber resmi tersedia.
- Jangan mengarang URL. Tautan sumber akan diambil aplikasi dari grounding metadata Google Search, bukan dari teks JSON buatan Anda.
- Materi pengguna tetap sumber utama; fakta web adalah pelengkap yang harus konsisten dengan ruang lingkup materi.

IDENTITAS TARGET RPP:
- Jika identitas target diberikan oleh guru, gunakan Mata Pelajaran, Jenjang, Kelas, Fase, Elemen, Topik, dan Subtopik sebagai konteks utama untuk membatasi analisis dan kueri riset web.
- Identitas target adalah pilihan pengguna dan JANGAN ditimpa oleh hasil deteksi dokumen. Field detectedLevel/detectedGrade/detectedPhase/detectedSubject tetap menggambarkan SASARAN SUMBER yang terdeteksi agar aplikasi dapat menampilkan konflik bila sumber berbeda dengan target RPP.
- Jangan mengadaptasi materi lintas kelas/fase secara diam-diam.`;

    if (fileData && Array.isArray(fileData)) {
      for (const file of fileData) {
        parts.push({ text: `[Nama File Sumber: ${file.name || "tanpa nama"}]` });
        if (file.text && typeof file.text === "string") {
          parts.push({ text: `[Isi File: ${file.name}]\n${file.text}` });
          continue;
        }
        if (file.base64 && (file.mimeType === "application/pdf" || file.mimeType?.startsWith("image/"))) {
          parts.push({ inlineData: { mimeType: file.mimeType, data: file.base64 } });
        }
      }
    }

    if (typedText && typedText.trim()) {
      parts.push({
        text: `[Materi Teks Pengguna (Prioritas Utama)]:\n${typedText.trim()}`,
      });
    }

    if (notes && notes.trim()) {
      parts.push({
        text: `[Catatan Khusus dari Guru]:\n${notes.trim()}`,
      });
    }

    if (parts.length === 0) {
      return NextResponse.json(
        { error: "Materi pembelajaran tidak boleh kosong. Harap unggah file atau ketik teks materi." },
        { status: 400 }
      );
    }

    if (identityContext && typeof identityContext === 'object') {
      const target = [
        identityContext.educationLevel && `Jenjang: ${identityContext.educationLevel}`,
        identityContext.subject && `Mata Pelajaran: ${identityContext.subject}`,
        identityContext.grade && `Kelas: ${identityContext.grade}`,
        identityContext.phase && `Fase: ${identityContext.phase}`,
        identityContext.element && `Elemen: ${identityContext.element}`,
        identityContext.topic && `Topik target: ${identityContext.topic}`,
        identityContext.subtopic && `Subtopik target: ${identityContext.subtopic}`,
      ].filter(Boolean).join('\n');
      if (target) parts.unshift({ text: `[Identitas Target RPP dari Guru — Otoritatif]\n${target}` });
    }

    parts.push({
      text: webResearchEnabled
        ? "Lakukan analisis komprehensif terhadap materi di atas. Gunakan Google Search bila dapat menambah akurasi/konteks, prioritaskan sumber resmi, lalu kembalikan JSON sesuai schema."
        : "Lakukan analisis komprehensif terhadap materi di atas dan kembalikan struktur data JSON sesuai schema yang diminta.",
    });

    const response = await generateContentWithRetry({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.2,
        ...(webResearchEnabled ? { tools: [{ googleSearch: {} }] } : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Judul atau topik utama materi" },
            subtopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar 2-5 subtopik esensial yang bersama-sama mencakup ruang lingkup konsep dan keterampilan utama; jangan terlalu menyempit pada satu bagian bila materi mencakup beberapa bahasan",
            },
            coreConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Konsep-konsep inti yang harus dipahami murid",
            },
            prerequisiteConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pengetahuan/konsep prasyarat yang dibutuhkan",
            },
            keyTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Istilah-istilah/glosarium penting dalam materi",
            },
            keyFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fakta atau informasi penting utama",
            },
            targetSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Keterampilan operasional yang dapat dikembangkan",
            },
            authenticContext: {
              type: Type.STRING,
              description: "Masalah nyata / konteks kehidupan sehari-hari yang relevan",
            },
            potentialProducts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potensi produk pembelajaran (misal: infografis, poster, laporan, prototipe)",
            },
            potentialActivities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potensi kegiatan pembelajaran mendalam",
            },
            potentialAssessments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potensi asesmen yang sesuai",
            },
            detectedLevel: { type: Type.STRING, description: "Jenjang terdeteksi (SD/MI, SMP/MTs, SMA/MA, SMK/MAK) jika ada" },
            detectedGrade: { type: Type.STRING, description: "Kelas terdeteksi (misal: Kelas IX, Kelas VII, Kelas X) jika ada" },
            detectedPhase: { type: Type.STRING, description: "Fase terdeteksi (misal: Fase D, Fase E) jika ada" },
            detectedSubject: { type: Type.STRING, description: "Mata pelajaran terdeteksi jika ada" },
            detectedElement: { type: Type.STRING, description: "Elemen pembelajaran yang tertulis eksplisit pada sumber jika ada" },
            generatedElement: { type: Type.STRING, description: "Saran elemen pembelajaran berbasis mapel, fase, dan materi; wajib ditinjau guru" },
            detectedCP: { type: Type.STRING, description: "Capaian Pembelajaran terdeteksi dari file jika ada" },
            generatedCP: { type: Type.STRING, description: "Draft CP berbasis analisis materi; bukan klaim CP resmi" },
            sensitiveContentType: { type: Type.STRING, description: "Kategori konten sensitif: LAW, HEALTH, STATISTICS, POLICY, atau NONE" },
            sensitiveWarningNote: { type: Type.STRING, description: "Peringatan khusus untuk guru jika materi memuat hukum/regulasi/data dinamis" },
          },
          required: [
            "title",
            "subtopics",
            "coreConcepts",
            "prerequisiteConcepts",
            "keyTerms",
            "keyFacts",
            "targetSkills",
            "authenticContext",
            "potentialProducts",
            "potentialActivities",
            "potentialAssessments",
            "generatedElement",
            "generatedCP",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const analysis = JSON.parse(resultText);
    if (typeof analysis.generatedCP === 'string') {
      analysis.generatedCP = analysis.generatedCP
        .replace(/^\s*Draft\s+saran\s+AI\s*\([^)]*\)\s*:\s*/i, '')
        .replace(/^\s*Draft\s+AI\s*[-–—:]?\s*/i, '')
        .trim();
    }
    const grounding = extractWebGrounding(response);
    
    // Also extract URLs from source text/notes to ensure user-provided links are never lost
    const textUrls = extractUrlsFromText(`${typedText || ''} ${notes || ''} ${JSON.stringify(fileData || [])} ${resultText}`);
    const mergedSources = [...grounding.sources];
    const seenUrls = new Set(mergedSources.map((s) => s.url));
    for (const ext of textUrls) {
      if (!seenUrls.has(ext.url)) {
        seenUrls.add(ext.url);
        mergedSources.push(ext);
      }
    }

    analysis.webResearchUsed = Boolean(webResearchEnabled && (mergedSources.length || grounding.queries.length));
    analysis.webSources = mergedSources;
    analysis.webSearchQueries = grounding.queries;
    analysis.searchEntryPointHtml = grounding.searchEntryPointHtml;

    // Fallback file name detection if AI didn't catch explicit patterns
    if (fileData && Array.isArray(fileData)) {
      const fileNames = fileData.map((f: any) => f.name || '').join(' ').toUpperCase();
      if (!analysis.detectedGrade) {
        if (fileNames.includes('KLS-IX') || fileNames.includes('KLS-9') || fileNames.includes('KELAS-9') || fileNames.includes('KELAS-IX') || fileNames.includes('CLASS 9')) {
          analysis.detectedGrade = 'Kelas IX';
          analysis.detectedPhase = 'D';
          analysis.detectedLevel = 'SMP/MTs';
        } else if (fileNames.includes('KLS-VIII') || fileNames.includes('KLS-8') || fileNames.includes('KELAS-8') || fileNames.includes('KELAS-VIII')) {
          analysis.detectedGrade = 'Kelas VIII';
          analysis.detectedPhase = 'D';
          analysis.detectedLevel = 'SMP/MTs';
        } else if (fileNames.includes('KLS-VII') || fileNames.includes('KLS-7') || fileNames.includes('KELAS-7') || fileNames.includes('KELAS-VII')) {
          analysis.detectedGrade = 'Kelas VII';
          analysis.detectedPhase = 'D';
          analysis.detectedLevel = 'SMP/MTs';
        } else if (fileNames.includes('KLS-X') || fileNames.includes('KLS-10') || fileNames.includes('KELAS-10') || fileNames.includes('KELAS-X')) {
          analysis.detectedGrade = 'Kelas X';
          analysis.detectedPhase = 'E';
          analysis.detectedLevel = 'SMA/MA';
        }
      }
      if (!analysis.detectedSubject) {
        if (fileNames.includes('IPS')) analysis.detectedSubject = 'Ilmu Pengetahuan Sosial (IPS)';
        else if (fileNames.includes('IPA')) analysis.detectedSubject = 'Ilmu Pengetahuan Alam (IPA)';
        else if (fileNames.includes('MATEMATIKA') || fileNames.includes('MTK')) analysis.detectedSubject = 'Matematika';
      }
    }


    // Fallback keyword check for law regulations or statutes
    const fullSourceText = `${typedText || ''} ${JSON.stringify(fileData || [])} ${JSON.stringify(analysis || {})}`;
    if (/\b(uu|undang-undang|pasal|sanksi|pidana|denda|peraturan|keputusan Presiden|uu no\.)\b/i.test(fullSourceText)) {
      analysis.sensitiveContentType = 'LAW';
      analysis.sensitiveWarningNote = '⚠️ Materi memuat regulasi/peraturan. Verifikasi status regulasi terbaru pada sumber resmi sebelum digunakan.';
    }

    const rawTextParts = [
      typedText || '',
      notes || '',
      ...(Array.isArray(fileData) ? fileData.map((file: any) => file?.text || '') : []),
    ].filter((text) => typeof text === 'string' && text.trim());
    analysis.rawTextContext = rawTextParts.join('\n\n').slice(0, 30000);

    analysis.detectedGrade = normalizeGrade(analysis.detectedGrade || "");
    analysis.detectedPhase = normalizePhase(analysis.detectedPhase || "");
    analysis.detectedLevel = normalizeEducationLevel(analysis.detectedLevel || "");

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Error analyzing material:", error);
    const statusCode = error?.statusCode || (error?.isQuota ? 429 : 500);
    const message = error?.message || "Gagal menganalisis materi dengan AI";
    return NextResponse.json(
      { error: message, isQuota: Boolean(error?.isQuota || statusCode === 429) },
      { status: statusCode }
    );
  }
}
