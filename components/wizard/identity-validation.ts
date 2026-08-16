import type { SchoolIdentity } from '../../types/rpp';

export interface IdentityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIdentityStep(identity: SchoolIdentity): IdentityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!identity.teacherName?.trim()) {
    errors.push('Nama guru wajib diisi.');
  }
  if (!identity.schoolName?.trim()) {
    errors.push('Satuan pendidikan wajib diisi.');
  }
  if (!identity.subject?.trim()) {
    errors.push('Mata pelajaran wajib diisi.');
  }
  if (!identity.grade?.trim()) {
    errors.push('Kelas wajib diisi.');
  }
  if (!identity.phase?.trim()) {
    errors.push('Fase Kurikulum Merdeka wajib diisi.');
  }

  if (identity.jpCount <= 0) {
    errors.push('Jumlah JP harus lebih dari 0.');
  }
  if (identity.durationPerJP <= 0) {
    errors.push('Durasi per JP harus lebih dari 0.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
