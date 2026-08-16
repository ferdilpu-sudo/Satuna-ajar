import { buildTrialUsageSnapshot, type TrialUsageSnapshot } from './trial-policy';

export const INSTALL_TRIAL_MULTIPLIER = 2;

export function effectiveTrialUsage(
  accountUsed: number | null,
  installUsed: number,
  freeGenerations: number,
): TrialUsageSnapshot {
  if (accountUsed === null) return buildTrialUsageSnapshot(installUsed, freeGenerations);
  const accountRemaining = Math.max(0, freeGenerations - accountUsed);
  const installLimit = freeGenerations * INSTALL_TRIAL_MULTIPLIER;
  const installRemaining = Math.max(0, installLimit - installUsed);
  const remaining = Math.min(accountRemaining, installRemaining);
  return buildTrialUsageSnapshot(freeGenerations - remaining, freeGenerations);
}

export function canReserveAuthenticatedTrial(
  accountNext: number,
  installNext: number,
  freeGenerations: number,
): boolean {
  return accountNext <= freeGenerations
    && installNext <= freeGenerations * INSTALL_TRIAL_MULTIPLIER;
}
