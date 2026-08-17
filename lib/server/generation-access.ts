import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUserId } from './auth-user';
import {
  reserveTrialGeneration,
  trialDeniedResponse,
  type TrialReservation,
} from './trial-guard';

export type GenerationAccessSource = 'trial' | 'one_time' | 'subscription';
export type GenerationAccessCode =
  | 'TRIAL_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'GENERATION_BALANCE_EXHAUSTED';

export interface GenerationAccessReservation {
  allowed: boolean;
  source?: GenerationAccessSource;
  code?: GenerationAccessCode;
  trial: TrialReservation;
  attach: (response: NextResponse) => NextResponse;
  complete: (metadata?: GenerationFinalizeMetadata) => Promise<void>;
  release: (metadata?: GenerationFinalizeMetadata) => Promise<void>;
}

interface PaidReservationRow {
  access_source: 'one_time' | 'subscription';
  reserved_entitlement_id: string | null;
  reserved_subscription_id: string | null;
}

interface GenerationFinalizeMetadata {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostAmount?: number;
}

function attachSource(response: NextResponse, source?: GenerationAccessSource): NextResponse {
  if (source) response.headers.set('X-Satuna-Generation-Source', source);
  return response;
}

function buildReservationBase(trial: TrialReservation, source?: GenerationAccessSource) {
  return {
    trial,
    attach: (response: NextResponse) => attachSource(trial.attach(response), source),
  };
}

async function finalizePaidGeneration(
  idempotencyKey: string,
  success: boolean,
  metadata?: GenerationFinalizeMetadata,
): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('finalize_paid_generation', {
      p_idempotency_key: idempotencyKey,
      p_success: success,
      p_model: metadata?.model ?? null,
      p_input_tokens: metadata?.inputTokens ?? null,
      p_output_tokens: metadata?.outputTokens ?? null,
      p_estimated_cost_amount: metadata?.estimatedCostAmount ?? null,
    });
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to ${success ? 'complete' : 'release'} paid generation reservation:`, error);
  }
}

export async function reserveGenerationAccess(req: NextRequest): Promise<GenerationAccessReservation> {
  const trial = await reserveTrialGeneration(req);

  if (trial.allowed) {
    return {
      ...buildReservationBase(trial, 'trial'),
      allowed: true,
      source: 'trial',
      complete: async () => undefined,
      release: async () => trial.release(),
    };
  }

  if (trial.code === 'RATE_LIMITED') {
    return {
      ...buildReservationBase(trial),
      allowed: false,
      code: 'RATE_LIMITED',
      complete: async () => undefined,
      release: async () => undefined,
    };
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return {
      ...buildReservationBase(trial),
      allowed: false,
      code: 'TRIAL_EXHAUSTED',
      complete: async () => undefined,
      release: async () => undefined,
    };
  }

  const idempotencyKey = randomUUID();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reserve_paid_generation', {
    p_idempotency_key: idempotencyKey,
    p_generation_reference: null,
  });

  if (error) throw new Error(`PAID_GENERATION_RESERVATION_FAILED: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : null) as PaidReservationRow | undefined;
  if (!row?.access_source) {
    return {
      ...buildReservationBase(trial),
      allowed: false,
      code: 'GENERATION_BALANCE_EXHAUSTED',
      complete: async () => undefined,
      release: async () => undefined,
    };
  }

  const source = row.access_source;
  return {
    ...buildReservationBase(trial, source),
    allowed: true,
    source,
    complete: async (metadata) => finalizePaidGeneration(idempotencyKey, true, metadata),
    release: async (metadata) => finalizePaidGeneration(idempotencyKey, false, metadata),
  };
}

export function generationAccessDeniedResponse(reservation: GenerationAccessReservation): NextResponse {
  if (reservation.code !== 'GENERATION_BALANCE_EXHAUSTED') {
    return trialDeniedResponse(reservation.trial);
  }

  const response = NextResponse.json({
    error: 'Trial gratis sudah selesai dan saldo generate berbayar Anda tidak tersedia. Pilih paket generate untuk melanjutkan.',
    code: 'GENERATION_BALANCE_EXHAUSTED',
    isQuota: false,
    trial: reservation.trial.usage,
  }, { status: 402 });

  return reservation.attach(response);
}
