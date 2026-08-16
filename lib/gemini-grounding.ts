import type { WebResearchSource } from '../types/rpp';

interface GroundingWebLike {
  title?: string;
  uri?: string;
  url?: string;
}

interface GroundingChunkLike {
  web?: GroundingWebLike;
  web_chunk?: GroundingWebLike;
  webChunk?: GroundingWebLike;
  title?: string;
  uri?: string;
  url?: string;
}

interface GroundingMetadataLike {
  groundingChunks?: GroundingChunkLike[];
  grounding_chunks?: GroundingChunkLike[];
  webSearchQueries?: string[];
  web_search_queries?: string[];
  searchEntryPoint?: { renderedContent?: string };
  search_entry_point?: { rendered_content?: string };
}

interface GroundingResponseLike {
  candidates?: Array<{
    groundingMetadata?: GroundingMetadataLike;
    grounding_metadata?: GroundingMetadataLike;
  }>;
  groundingMetadata?: GroundingMetadataLike;
  grounding_metadata?: GroundingMetadataLike;
}

/** Parse Gemini grounding metadata while safely accepting text-only provider responses. */
export function extractWebGrounding(response: unknown): {
  sources: WebResearchSource[];
  queries: string[];
  searchEntryPointHtml?: string;
} {
  const payload = response && typeof response === 'object'
    ? response as GroundingResponseLike
    : {};

  const metadata =
    payload.candidates?.[0]?.groundingMetadata ||
    payload.groundingMetadata ||
    payload.candidates?.[0]?.grounding_metadata ||
    payload.grounding_metadata;

  const sources: WebResearchSource[] = [];
  const seen = new Set<string>();
  const chunks = metadata?.groundingChunks || metadata?.grounding_chunks || [];

  for (const chunk of chunks) {
    const web = chunk.web || chunk.web_chunk || chunk.webChunk;
    const url = (web?.uri || web?.url || chunk.uri || chunk.url)?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    let domain: string | undefined;
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {}

    sources.push({
      title: web?.title?.trim() || chunk.title?.trim() || domain || 'Sumber Web',
      url,
      domain,
    });
  }

  const rawQueries = metadata?.webSearchQueries || metadata?.web_search_queries || [];
  const queries = Array.from(new Set(rawQueries.map((query) => query.trim()).filter(Boolean)));
  const searchEntryPointHtml =
    metadata?.searchEntryPoint?.renderedContent ||
    metadata?.search_entry_point?.rendered_content;

  return { sources, queries, searchEntryPointHtml };
}
