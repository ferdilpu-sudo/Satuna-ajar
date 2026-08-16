import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { generateContentWithRetry } from '../../../../lib/gemini';
import { normalizeEducationLevel, normalizeGrade, normalizePhase, validateBeforeGeneration, validatePedagogicalPlan } from '../../../../lib/validation';
import type { SchoolIdentity } from '../../../../types/rpp';
import { generatePedagogicalPlan } from './planner';
import { repairAssessmentQuestions } from './assessment-repair';
import { buildRPPData } from './post-process';
import { buildSystemInstruction, buildUserPrompt } from './prompt';
import { responseSchemaForOutput } from './schema';
import { reserveTrialGeneration, trialDeniedResponse, type TrialReservation } from '../../../../lib/server/trial-guard';

export async function POST(req: NextRequest) {
  let trialReservation: TrialReservation | null = null;
  try {
    const body = await req.json();
    const { materialAnalysis, identity: rawIdentity, settings, selectedDimensions, outputConfig, sourceFiles = [] } = body;
    if (!materialAnalysis || !rawIdentity || !settings || !outputConfig) {
      return NextResponse.json({ error: 'Data analisis materi, identitas, pengaturan, dan output wajib diisi.' }, { status: 400 });
    }

    const identity: SchoolIdentity = {
      ...rawIdentity,
      educationLevel: normalizeEducationLevel(rawIdentity.educationLevel),
      grade: normalizeGrade(rawIdentity.grade),
      phase: normalizePhase(rawIdentity.phase),
      totalMinutes: Number(rawIdentity.totalMinutes) || Number(rawIdentity.jpCount) * Number(rawIdentity.durationPerJP) * Number(rawIdentity.meetingCount),
    };

    const preValidation = validateBeforeGeneration(identity, materialAnalysis);
    if (!preValidation.valid) {
      return NextResponse.json({
        error: 'Data pembelajaran belum konsisten. Perbaiki identitas/CP sebelum generate.',
        code: 'PRE_GENERATION_VALIDATION_FAILED',
        details: preValidation.errors,
        warnings: preValidation.warnings,
      }, { status: 422 });
    }

    trialReservation = await reserveTrialGeneration(req);
    if (!trialReservation.allowed) return trialDeniedResponse(trialReservation);

    const dimensions = selectedDimensions || [];
    const pedagogicalPlan = await generatePedagogicalPlan({ materialAnalysis, identity, settings, selectedDimensions: dimensions, outputConfig });
    const planValidation = validatePedagogicalPlan(pedagogicalPlan);
    if (!planValidation.valid) {
      await trialReservation.release();
      trialReservation = null;
      return NextResponse.json({
        error: 'Blueprint pedagogis AI belum konsisten. Silakan generate ulang.',
        code: 'PEDAGOGICAL_PLAN_INVALID',
        details: planValidation.issues,
      }, { status: 502 });
    }

    const promptInput = {
      materialAnalysis,
      identity,
      settings,
      selectedDimensions: dimensions,
      outputConfig,
      totalMinutes: identity.totalMinutes,
      sourceFiles,
      pedagogicalPlan,
    };
    const response = await generateContentWithRetry({
      model: 'gemini-3.6-flash',
      contents: buildUserPrompt(promptInput),
      config: {
        systemInstruction: buildSystemInstruction(promptInput),
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: responseSchemaForOutput(outputConfig),
      },
    }, 3, 2000);

    const parsed = JSON.parse(response.text || '{}');
    try {
      const repair = await repairAssessmentQuestions({
        questions: parsed.assessment?.summativeQuestions || [],
        pedagogicalPlan,
        materialAnalysis,
        identity,
      }, 2);
      parsed.assessment = {
        ...(parsed.assessment || {}),
        summativeQuestions: repair.questions,
      };
      if (repair.remainingIssues.length) {
        console.warn('Assessment auto-repair left unresolved items:', repair.remainingIssues);
      }
    } catch (repairError) {
      console.warn('Assessment auto-repair skipped after AI error:', repairError);
    }

    const rppData = buildRPPData({ parsed, identity, settings, materialAnalysis, selectedDimensions: dimensions, outputConfig, sourceFiles, pedagogicalPlan });
    const successResponse = NextResponse.json({ rppData, warnings: preValidation.warnings, trial: trialReservation.usage });
    return trialReservation.attach(successResponse);
  } catch (error: any) {
    if (trialReservation?.allowed) {
      try { await trialReservation.release(); } catch (releaseError) { console.error('Failed to rollback trial reservation:', releaseError); }
    }
    console.error('Error generating learning document:', error);
    const statusCode = error?.statusCode || (error?.isQuota ? 429 : 500);
    const message = error?.message || 'Gagal membuat dokumen pembelajaran dengan AI';
    return NextResponse.json({ error: message, isQuota: Boolean(error?.isQuota || statusCode === 429) }, { status: statusCode });
  }
}
