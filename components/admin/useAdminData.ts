'use client';

import { useEffect, useState } from 'react';
import type { AdminCommerceData, AdminUserRow } from '@/types/admin';

export function useAdminUsers() {
  return useAdminFetch<AdminUserRow[]>('/api/admin/users', []);
}

export function useAdminCommerce() {
  return useAdminFetch<AdminCommerceData>('/api/admin/commerce', {
    activeSubscriptions: 0,
    oneTimeTransactions30d: 0,
    oneTimeBuyers30d: 0,
    unusedGenerationRights: 0,
    monthRevenue: 0,
    recurringRevenue: 0,
    oneTimeRevenue: 0,
    subscriptions: [],
    oneTimePurchases: [],
    payments: [],
  });
}

function useAdminFetch<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(url, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? 'Gagal memuat data admin.');
        return body.data as T;
      })
      .then((value) => { if (active) setData(value); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Gagal memuat data admin.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url]);

  return { data, loading, error };
}
