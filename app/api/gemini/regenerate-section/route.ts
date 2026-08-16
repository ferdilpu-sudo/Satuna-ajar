import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { generateContentWithRetry } from '@/lib/gemini';
import { extractFactAnchors } from '@/lib/validation';
import { normalizeAssessmentItems, normalizeLearningObjectives, normalizeModelSyntaxLabels, rebalanceActivityTime } from '../generate-rpp/post-process-helpers';
import { repairObjectiveMappings } from '../generate-rpp/assessment-mapping';
import { cleanGeneratedTextFields } from '../generate-rpp/text-quality';
import { HUMAN_LANGUAGE_RULES } from '../generate-rpp/human-language';
import { checkIpRateLimit, rateLimitResponse } from '@/lib/server/rate-limit';

function unsupportedAnchors(previousRpp: unknown, generated: unknown): string[] {
  const source = extractFactAnchors(JSON.stringify(previousRpp || {}));
  const next = extractFactAnchors(JSON.stringify(generated || {}));
  return [...next].filter((anchor) => !source.has(anchor));
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkIpRateLimit(req, 'regenerate-section', 30);
    if (rateLimit && !rateLimit.allowed) return rateLimitResponse(rateLimit);
    const body = await req.json();
    const { sectionKey, fullRPP, promptInstruction } = body;
    if (!sectionKey || !fullRPP) {
      return NextResponse.json({ error: 'Section key dan data RPP wajib diisi.' }, { status: 400 });
    }

    const systemInstruction = `Anda adalah pakar Kurikulum Merdeka dan Pembelajaran Mendalam.
Perbarui HANYA bagian '${sectionKey}' dari RPP yang diberikan.
WAJIB SOURCE-GROUNDED: jangan menambahkan tanggal, tahun, nomor regulasi, pasal, tokoh, lokasi, atau klaim faktual spesifik yang tidak sudah ada dalam konteks RPP. Jangan mengubah identitas pengguna.
Jika meregenerasi activities: experience hanya MEMAHAMI/MENGAPLIKASI/MEREFLEKSI dan deepLearningBadges hanya Berkesadaran/Bermakna/Menggembirakan.
${HUMAN_LANGUAGE_RULES}
Kembalikan HANYA JSON valid untuk bagian '${sectionKey}'.`;

    const factualContext = {
      identity: fullRPP.identity,
      essentialMaterial: fullRPP.essentialMaterial,
      learningObjectives: fullRPP.learningObjectives,
      sourcesUsed: fullRPP.sourcesUsed,
      currentSection: fullRPP[sectionKey],
    };
    const prompt = `KONTEKS RPP YANG MENJADI BATAS FAKTA:\n${JSON.stringify(factualContext)}\n\nInstruksi Guru: ${promptInstruction || 'Buat versi yang lebih jelas, alami, dan mudah dipahami guru tanpa menambah fakta baru.'}\n\nRegenerasi bagian '${sectionKey}'.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { systemInstruction, temperature: 0.2, responseMimeType: 'application/json' },
    }, 3, 2000);

    let newSectionData = cleanGeneratedTextFields(JSON.parse(response.text || '{}'));
    const unsupported = unsupportedAnchors(factualContext, newSectionData);
    if (unsupported.length) {
      return NextResponse.json({
        error: 'Hasil regenerasi menambahkan fakta bertanggal/regulasi yang tidak ada pada konteks sumber.',
        code: 'SOURCE_GROUNDING_FAILED',
        details: unsupported,
      }, { status: 422 });
    }

    if (sectionKey === 'learningObjectives' && Array.isArray(newSectionData)) {
      newSectionData = normalizeLearningObjectives(newSectionData);
    }
    if (sectionKey === 'activities' && Array.isArray(newSectionData)) {
      const rebalanced = rebalanceActivityTime(newSectionData, fullRPP.identity);
      newSectionData = normalizeModelSyntaxLabels(rebalanced, fullRPP.learningSettings?.resolvedModel || fullRPP.learningSettings?.model || '');
    }
    if (sectionKey === 'assessment' && Array.isArray(newSectionData?.summativeQuestions)) {
      const normalized = normalizeAssessmentItems(newSectionData.summativeQuestions, fullRPP.learningObjectives || []);
      newSectionData = {
        ...newSectionData,
        summativeQuestions: repairObjectiveMappings(normalized, fullRPP.learningObjectives || []),
      };
    }
    return NextResponse.json({ newSectionData });
  } catch (error: any) {
    console.error('Error regenerating section:', error);
    const statusCode = error?.statusCode || (error?.isQuota ? 429 : 500);
    const message = error?.message || 'Gagal meregenerasi bagian RPP';
    return NextResponse.json(
      { error: message, isQuota: Boolean(error?.isQuota || statusCode === 429) },
      { status: statusCode }
    );
  }
}
