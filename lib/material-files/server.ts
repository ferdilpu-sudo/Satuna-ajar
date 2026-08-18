import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  MATERIAL_UPLOAD_BUCKET,
  MAX_MATERIAL_FILE_BYTES,
  isSupportedBinaryMaterialMime,
  materialFileSizeLabel,
} from './config';

interface MaterialFilePayload {
  name?: string;
  size?: number;
  mimeType?: string;
  text?: string;
  base64?: string;
  storagePath?: string;
}

export async function resolveMaterialFileParts(fileData: unknown): Promise<any[]> {
  if (!Array.isArray(fileData)) return [];

  const parts: any[] = [];
  const storedFiles = fileData.filter((file): file is MaterialFilePayload => {
    if (!file || typeof file !== 'object') return false;
    return typeof (file as MaterialFilePayload).storagePath === 'string';
  });
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let userId: string | null = null;

  if (storedFiles.length) {
    supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw materialFileError('AUTH_REQUIRED', 401);
    userId = authData.user.id;
  }

  for (const rawFile of fileData) {
    if (!rawFile || typeof rawFile !== 'object') continue;
    const file = rawFile as MaterialFilePayload;
    const name = typeof file.name === 'string' && file.name ? file.name : 'tanpa nama';
    const mimeType = typeof file.mimeType === 'string' ? file.mimeType : '';

    parts.push({ text: `[Nama File Sumber: ${name}]` });

    if (typeof file.text === 'string' && file.text.trim()) {
      parts.push({ text: `[Isi File: ${name}]\n${file.text}` });
      continue;
    }

    if (typeof file.storagePath === 'string') {
      if (!supabase || !userId) throw materialFileError('AUTH_REQUIRED', 401);
      if (!file.storagePath.startsWith(`${userId}/`)) {
        throw materialFileError('Lampiran tidak valid untuk akun ini.', 403);
      }
      if (!isSupportedBinaryMaterialMime(mimeType)) {
        throw materialFileError(`Format lampiran ${name} tidak didukung.`, 415);
      }

      const { data: blob, error } = await supabase.storage.from(MATERIAL_UPLOAD_BUCKET).download(file.storagePath);
      if (error || !blob) {
        throw materialFileError(`Lampiran ${name} tidak dapat dibaca. Unggah ulang file lalu coba lagi.`, 422);
      }
      if (blob.size > MAX_MATERIAL_FILE_BYTES) {
        throw materialFileError(`Ukuran ${name} melebihi batas ${materialFileSizeLabel()} per file.`, 413);
      }

      const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64');
      parts.push({ inlineData: { mimeType, data: base64 } });
      continue;
    }

    // Backward compatibility for small requests from an older client during rollout.
    if (typeof file.base64 === 'string' && file.base64 && isSupportedBinaryMaterialMime(mimeType)) {
      parts.push({ inlineData: { mimeType, data: file.base64 } });
    }
  }

  return parts;
}

function materialFileError(message: string, statusCode: number): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}
