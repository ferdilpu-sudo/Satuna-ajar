'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';

interface TrialUsage {
  limit: number;
  used: number;
  remaining: number;
  exhausted: boolean;
}

export default function TrialUsageCard({ onExhaustedChange }: { onExhaustedChange?: (value: boolean) => void }) {
  const [trial, setTrial] = useState<TrialUsage | null>(null);
  const [enforced, setEnforced] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/usage/trial', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data?.trial) return;
        setTrial(data.trial as TrialUsage);
        setEnforced(Boolean(data.enforced));
        onExhaustedChange?.(Boolean(data.enforced && data.trial.exhausted));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [onExhaustedChange]);

  if (loading) {
    return <div className="flex min-h-14 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Memeriksa kuota trial...</div>;
  }
  if (!trial || !enforced) return null;

  return (
    <div className={`rounded-xl border p-3 text-xs ${trial.exhausted ? 'border-amber-200 bg-amber-50' : 'border-blue-100 bg-blue-50/50'}`}>
      <div className="flex items-start gap-2.5">
        <StreamlineDuotoneIcon name="magic" className={`mt-0.5 h-4 w-4 shrink-0 ${trial.exhausted ? 'text-amber-700' : 'text-blue-700'}`} />
        <div className="min-w-0">
          <p className={`font-extrabold ${trial.exhausted ? 'text-amber-900' : 'text-blue-900'}`}>Trial Satuna Ajar</p>
          <p className="mt-0.5 leading-5 text-slate-600">
            {trial.exhausted
              ? `Batas ${trial.limit} pembuatan gratis sudah digunakan.`
              : `Sisa ${trial.remaining} dari ${trial.limit} pembuatan dokumen AI gratis.`}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Dokumen yang sudah dibuat tetap dapat dibuka, disunting, dan diekspor.</p>
        </div>
      </div>
    </div>
  );
}
