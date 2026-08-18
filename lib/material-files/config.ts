export const MATERIAL_UPLOAD_BUCKET = 'material-analysis';
export const MAX_MATERIAL_FILE_BYTES = 15 * 1024 * 1024;

const SUPPORTED_BINARY_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function isSupportedBinaryMaterialMime(mimeType: string): boolean {
  return SUPPORTED_BINARY_MIME_TYPES.has(mimeType.toLowerCase());
}

export function materialFileSizeLabel(): string {
  return `${MAX_MATERIAL_FILE_BYTES / 1024 / 1024} MB`;
}
