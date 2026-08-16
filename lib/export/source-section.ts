import type { RPPData, WebResearchSource } from '../../types/rpp';
import { escapeHtml } from './format';

export function extractUrlsFromText(text: string): WebResearchSource[] {
  if (!text) return [];
  const sources: WebResearchSource[] = [];
  const seen = new Set<string>();

  // Match Markdown links [Title](https://...)
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdRegex.exec(text)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      let domain: string | undefined;
      try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}
      sources.push({ title: title || domain || 'Sumber Web', url, domain });
    }
  }

  // Match raw URLs https://... or http://...
  const rawUrlRegex = /(https?:\/\/[^\s<>"'()]+)/g;
  while ((match = rawUrlRegex.exec(text)) !== null) {
    const url = match[1].replace(/[.,;:()\]]+$/, '').trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      let domain: string | undefined;
      try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}
      sources.push({ title: domain ? `Situs ${domain}` : 'Sumber Web', url, domain });
    }
  }

  return sources;
}

export function getCombinedResearchSources(rpp: RPPData): WebResearchSource[] {
  const sources: WebResearchSource[] = [];
  const seen = new Set<string>();

  const addSource = (title: string, url: string, domain?: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl || seen.has(cleanUrl)) return;
    seen.add(cleanUrl);
    let resolvedDomain = domain;
    if (!resolvedDomain) {
      try { resolvedDomain = new URL(cleanUrl).hostname.replace(/^www\./, ''); } catch {}
    }
    sources.push({ title: title.trim() || resolvedDomain || 'Sumber Web', url: cleanUrl, domain: resolvedDomain });
  };

  // Add existing researchSources
  for (const src of rpp.researchSources || []) {
    if (src?.url) addSource(src.title || 'Sumber Web', src.url, src.domain);
  }

  // Extract from facilities.learningSources
  for (const srcStr of rpp.facilities?.learningSources || []) {
    const extracted = extractUrlsFromText(srcStr);
    for (const ext of extracted) {
      addSource(ext.title, ext.url, ext.domain);
    }
  }

  // Extract from sourcesUsed
  for (const srcStr of rpp.sourcesUsed || []) {
    const extracted = extractUrlsFromText(srcStr);
    for (const ext of extracted) {
      addSource(ext.title, ext.url, ext.domain);
    }
  }

  // Extract from essentialMaterial summary
  if (rpp.essentialMaterial?.summary) {
    const extracted = extractUrlsFromText(rpp.essentialMaterial.summary);
    for (const ext of extracted) {
      addSource(ext.title, ext.url, ext.domain);
    }
  }

  return sources;
}

export function renderSourceBox(rpp: RPPData): string {
  const isRingkas = rpp.documentFormat === 'Ringkas';
  const sectionTitle = isRingkas ? 'F. SUMBER MATERI' : 'N. SUMBER MATERI';
  const userSources = rpp.sourcesUsed?.length ? rpp.sourcesUsed.map(escapeHtml).join(', ') : 'Materi Teks Pengguna';
  const combinedSources = getCombinedResearchSources(rpp);
  const learningSources = rpp.facilities?.learningSources || [];

  let webList = '';
  if (combinedSources.length) {
    webList = `<div style="margin-top:10px">
<b style="color:#0f172a;font-size:12px;">Sumber Riset Web:</b>
<ol style="margin-top:6px;padding-left:20px;list-style-type:decimal;">
${combinedSources.map((source) => `
<li style="margin-bottom:8px;">
  <div style="font-weight:bold;color:#0f172a;">${escapeHtml(source.title)}</div>
  ${source.domain ? `<div style="font-size:11px;color:#64748b;margin-top:1px;">${escapeHtml(source.domain)}</div>` : ''}
  <div style="margin-top:2px;">
    <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer" style="color:#1d4ed8;text-decoration:underline;word-break:break-all;font-size:11px;">${escapeHtml(source.url)}</a>
  </div>
</li>
`).join('')}
</ol></div>`;
  }

  let additionalSources = '';
  const nonUrlSources = learningSources.filter((s) => !s.toLowerCase().includes('http://') && !s.toLowerCase().includes('https://') && !s.toLowerCase().includes('www.'));
  if (nonUrlSources.length) {
    additionalSources = `<div style="margin-top:10px"><b style="color:#0f172a;font-size:12px;">Sumber Belajar Lainnya:</b><ul style="margin-top:4px;padding-left:20px;">${nonUrlSources.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>`;
  }

  return `<div class="source-box" style="border:1px solid #cbd5e1;background:#f8fafc;padding:14px;border-radius:8px;margin-top:24px;">
<div style="font-weight:bold;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:10px;">${sectionTitle}</div>
<div><b>Sumber Utama:</b> ${escapeHtml(userSources)}</div>
${webList}
${additionalSources}
</div>`;
}

