'use client';

import React from 'react';
import { TEMPLATE_LIST } from '@/lib/storage';
import { ArrowRight } from 'lucide-react';
import StreamlineDuotoneIcon from './icons/StreamlineDuotoneIcon';

interface TemplateViewProps { onUseTemplate: (modelName: string) => void; }

export default function TemplateView({ onUseTemplate }: TemplateViewProps) {
  return (
    <div className="space-y-6 pb-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Strategi Pembelajaran</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Pilih template pembelajaran</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Mulai dari struktur model pembelajaran yang sudah memiliki alur sintaks jelas.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TEMPLATE_LIST.map((template) => (
          <article key={template.id} className="flex flex-col justify-between rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700"><StreamlineDuotoneIcon name="magic" className="h-3.5 w-3.5" />{template.model}</span>
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-slate-900">{template.name}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>

              <div className="mt-5 rounded-xl border border-[#E3E8E2] bg-[#F8FAF7] p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-700"><StreamlineDuotoneIcon name="layers" className="h-4 w-4 text-blue-600" />Tahapan sintaks</p>
                <ol className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
                  {template.syntaxSteps.map((step, index) => <li key={step}><span className="mr-2 font-bold text-slate-400">{index + 1}.</span>{step}</li>)}
                </ol>
              </div>
            </div>

            <button type="button" onClick={() => onUseTemplate(template.model)} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
              Gunakan Template <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
