import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export const TRIAL_COOKIE_NAME = 'satuna_trial_v1';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

export interface TrialIdentity {
  installId: string;
  installHash: string;
  ipHash: string;
  isNew: boolean;
  cookieValue: string;
}

function signature(id: string, secret: string): string {
  return createHmac('sha256', secret).update(id).digest('base64url');
}

export function createSignedTrialCookie(id: string, secret: string): string {
  return `${id}.${signature(id, secret)}`;
}

export function verifySignedTrialCookie(value: string | undefined, secret: string): string | null {
  if (!value || !secret) return null;
  const separator = value.lastIndexOf('.');
  if (separator <= 0) return null;
  const id = value.slice(0, separator);
  const supplied = value.slice(separator + 1);
  const expected = signature(id, secret);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(suppliedBuffer, expectedBuffer) ? id : null;
}

function requestIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function protectedHash(value: string, secret: string, purpose: string): string {
  if (secret) return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
  return createHash('sha256').update(`${purpose}:${value}`).digest('hex');
}

export function resolveTrialIdentity(req: NextRequest, secret: string): TrialIdentity {
  const existing = verifySignedTrialCookie(req.cookies.get(TRIAL_COOKIE_NAME)?.value, secret);
  const installId = existing || randomUUID();
  return {
    installId,
    installHash: protectedHash(installId, secret, 'install'),
    ipHash: protectedHash(requestIp(req), secret, 'ip'),
    isNew: !existing,
    cookieValue: createSignedTrialCookie(installId, secret),
  };
}

export function attachTrialCookie(response: NextResponse, identity: TrialIdentity): NextResponse {
  if (!identity.isNew) return response;
  response.cookies.set(TRIAL_COOKIE_NAME, identity.cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
