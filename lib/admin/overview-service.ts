import { createClient } from '@/lib/supabase/server';

export interface AdminOverviewMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  monthRevenue: number;
  monthOneTimeRevenue: number;
  mrr: number;
  generations30d: number;
  failedGenerations30d: number;
  aiCost30d: number;
}

const EMPTY_METRICS: AdminOverviewMetrics = {
  totalUsers: 0,
  activeSubscriptions: 0,
  monthRevenue: 0,
  monthOneTimeRevenue: 0,
  mrr: 0,
  generations30d: 0,
  failedGenerations30d: 0,
  aiCost30d: 0,
};

export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_overview_metrics');

  if (error) {
    throw new Error(`ADMIN_METRICS_FAILED: ${error.message}`);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return EMPTY_METRICS;
  }

  const value = data as Record<string, unknown>;
  return {
    totalUsers: Number(value.totalUsers ?? 0),
    activeSubscriptions: Number(value.activeSubscriptions ?? 0),
    monthRevenue: Number(value.monthRevenue ?? 0),
    monthOneTimeRevenue: Number(value.monthOneTimeRevenue ?? 0),
    mrr: Number(value.mrr ?? 0),
    generations30d: Number(value.generations30d ?? 0),
    failedGenerations30d: Number(value.failedGenerations30d ?? 0),
    aiCost30d: Number(value.aiCost30d ?? 0),
  };
}
