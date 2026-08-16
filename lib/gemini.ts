import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAi(): GoogleGenAI {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getAi(), prop, receiver);
  }
});

export class GeminiApiError extends Error {
  statusCode: number;
  isQuota: boolean;

  constructor(message: string, statusCode = 500, isQuota = false) {
    super(message);
    this.name = 'GeminiApiError';
    this.statusCode = statusCode;
    this.isQuota = isQuota;
  }
}

export function parseGeminiError(err: any): { message: string; statusCode: number; isQuota: boolean } {
  const rawMsg = err?.message || String(err || '');
  let isQuota = false;
  let cleanMsg = rawMsg;
  let statusCode = err?.status || err?.statusCode || 500;

  try {
    const jsonStart = rawMsg.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(rawMsg.slice(jsonStart));
      if (parsed?.error) {
        if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
          isQuota = true;
          statusCode = 429;
        }
        if (parsed.error.message) {
          cleanMsg = parsed.error.message;
        }
      }
    }
  } catch {
    // ignore json parse error
  }

  const lowerRaw = rawMsg.toLowerCase();
  if (
    lowerRaw.includes('429') ||
    lowerRaw.includes('resource_exhausted') ||
    lowerRaw.includes('quota') ||
    lowerRaw.includes('rate limit') ||
    lowerRaw.includes('ratelimit') ||
    lowerRaw.includes('too many requests')
  ) {
    isQuota = true;
    statusCode = 429;
  }

  if (isQuota) {
    cleanMsg = 'Batas kuota/rate limit penggunaan AI (Gemini API) telah tercapai. Silakan tunggu 1-2 menit lalu coba kembali.';
  } else if (!cleanMsg || cleanMsg.trim().startsWith('{')) {
    cleanMsg = 'Terjadi kesalahan saat menghubungkan ke layanan AI Gemini. Silakan coba kembali.';
  }

  return { message: cleanMsg, statusCode, isQuota };
}

export async function generateContentWithRetry(params: any, maxRetries = 3, baseDelayMs = 2000) {
  const initialModel = params.model || "gemini-3.6-flash";
  const candidates = Array.from(new Set([initialModel, "gemini-3.1-flash-lite", "gemini-flash-latest"]));
  
  let lastError: any;

  // Function to execute attempt loop for a parameter set
  const runCandidates = async (requestParams: any) => {
    for (const modelCandidate of candidates) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            ...requestParams,
            model: modelCandidate,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const parsedErr = parseGeminiError(err);
          const isTransient = 
            parsedErr.isQuota ||
            parsedErr.statusCode === 429 ||
            parsedErr.message.includes("503") || 
            parsedErr.message.includes("high demand") || 
            parsedErr.message.includes("UNAVAILABLE") || 
            parsedErr.message.includes("overloaded");

          if (isTransient) {
            if (attempt < maxRetries - 1) {
              const delay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
              console.warn(`Gemini API transient error (${modelCandidate}, attempt ${attempt + 1}/${maxRetries}): ${parsedErr.message}. Retrying in ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.warn(`Gemini API transient error persisted on model ${modelCandidate}. Trying fallback model candidate...`);
            }
          } else {
            // If non-transient, throw formatted error immediately
            throw new GeminiApiError(parsedErr.message, parsedErr.statusCode, parsedErr.isQuota);
          }
        }
      }
    }
    return null;
  };

  // First try with provided parameters
  const primaryResult = await runCandidates(params);
  if (primaryResult) return primaryResult;

  // If failed and request used search/tools, attempt fallback without tools
  if (params?.config?.tools?.length) {
    console.warn("Primary candidates failed with tools. Attempting fallback generation without tools...");
    const { tools, ...configWithoutTools } = params.config;
    const noToolsParams = { ...params, config: configWithoutTools };
    const fallbackResult = await runCandidates(noToolsParams);
    if (fallbackResult) return fallbackResult;
  }

  const finalParsed = parseGeminiError(lastError);
  throw new GeminiApiError(finalParsed.message, finalParsed.statusCode, finalParsed.isQuota);
}

