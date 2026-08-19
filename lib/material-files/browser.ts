'use client';

import { createClient } from '@/lib/supabase/client';
import {
  MATERIAL_UPLOAD_BUCKET,
  MAX_MATERIAL_FILE_BYTES,
  isSupportedBinaryMaterialMime,
  materialFileSizeLabel,
} from './config';

export interface StoredMaterialUpload {
  storagePath: string;
  mimeType: string;
}

export async function uploadMaterialBinary(file: File): Promise<StoredMaterialUpload> {
  const mimeType = file.type || 'application/octet-stream';
  if (!isSupportedBinaryMaterialMime(mimeType)) {
    throw new Error(`Format ${file.name} belum didukung untuk analisis langsung.`);
  }
  if (file.size > MAX_MATERIAL_FILE_BYTES) {
    throw new Error(`Ukuran ${file.name} melebihi batas ${materialFileSizeLabel()} per file.`);
  }

  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('Silakan masuk kembali sebelum mengunggah lampiran PDF atau gambar.');
  }

  const safeName = sanitizeStorageFileName(file.name);
  const storagePath = `${authData.user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(MATERIAL_UPLOAD_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah ${file.name}: ${uploadError.message}`);
  }

  return { storagePath, mimeType };
}

export async function removeStoredMaterial(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from(MATERIAL_UPLOAD_BUCKET).remove([storagePath]);
  if (error) console.warn('Temporary material cleanup failed:', error.message);
}

function sanitizeStorageFileName(name: string): string {
  const normalized = name.normalize('NFKD').replace(/[^A-Za-z0-9._-]+/g, '-');
  return normalized.replace(/^-+|-+$/g, '').slice(0, 120) || 'material-file';
}
