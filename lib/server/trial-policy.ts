export interface TrialUsageSnapshot {
  limit: number;
  used: number;
  remaining: number;
  exhausted: boolean;
}

export function buildTrialUsageSnapshot(usedValue: number, limitValue: number): TrialUsageSnapshot {
  const limit = Math.max(1, Math.floor(limitValue));
  const used = Math.max(0, Math.floor(usedValue));
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    exhausted: used >= limit,
  };
}

export function canReserveTrialGeneration(nextUsage: number, limit: number): boolean {
  return nextUsage >= 1 && nextUsage <= Math.max(1, Math.floor(limit));
}
