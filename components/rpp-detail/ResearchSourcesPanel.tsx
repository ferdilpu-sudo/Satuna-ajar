import { ExternalLink, Globe2, Search } from 'lucide-react';
import type { RPPData } from '../../types/rpp';
import { getCombinedResearchSources } from '../../lib/export/source-section';
import GoogleSearchAttribution from '../GoogleSearchAttribution';

export default function ResearchSourcesPanel({ rpp }: { rpp: RPPData }) {
  const sources = getCombinedResearchSources(rpp);
  if (!sources.length) return null;

  return (
    <aside className="rounded-2xl border border-[#DDE3DC] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Globe2 className="h-4 w-4 text-blue-600" />Sumber Riset Web</p>
          <p className="mt-1 text-[11px] text-slate-500">Tautan berasal dari grounding Google Search.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">{sources.length} sumber</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {sources.slice(0, 6).map((source, index) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="group flex items-start gap-2 rounded-xl border border-transparent px-2.5 py-2 hover:border-blue-100 hover:bg-blue-50/50">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-extrabold text-slate-500">{index + 1}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold text-slate-800 group-hover:text-blue-700">{source.title}</span><span className="block truncate text-[10px] text-slate-500">{source.domain || source.url}</span></span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-blue-600" />
          </a>
        ))}
      </div>

      {rpp.searchEntryPointHtml ? <div className="mt-3"><GoogleSearchAttribution html={rpp.searchEntryPointHtml} /></div> : null}

      {rpp.webSearchQueries?.length ? (
        <details className="mt-3 border-t border-[#EDF0EC] pt-3 text-[10px] text-slate-500">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-600"><Search className="h-3.5 w-3.5" />Lihat kueri pencarian</summary>
          <ul className="mt-2 space-y-1 pl-5">{rpp.webSearchQueries.map((query) => <li key={query} className="list-disc">{query}</li>)}</ul>
        </details>
      ) : null}
    </aside>
  );
}
