export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}

export function list(items?: string[]): string {
  return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function safe(value: unknown, fallback = '-'): string {
  const text = String(value ?? '').trim();
  return escapeHtml(text || fallback);
}

export function stripObjectivePrefix(value: string): string {
  return (value || '').replace(/^(?:\s*TP\s*\d+\s*[:.)-]\s*)+/i, '').trim();
}

export function activityStageLabel(value: string): string {
  if (value === 'PENDAHULUAN') return 'Pendahuluan';
  if (value === 'KEGIATAN INTI') return 'Kegiatan Inti';
  if (value === 'PENUTUP') return 'Penutup';
  return value;
}
