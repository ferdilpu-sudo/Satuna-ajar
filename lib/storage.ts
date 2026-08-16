import type { RPPData } from '../types/rpp';
export { TEMPLATE_LIST } from './templates';

const RPP_STORAGE_KEY = 'rpp_deep_learning_saved_list_v1';
const SETTINGS_STORAGE_KEY = 'rpp_deep_learning_user_settings_v1';
const LEGACY_FAKE_TEACHER = 'Budi Santoso, S.Pd.';
const LEGACY_FAKE_SCHOOL = 'SMA Negeri 1 Pembelajaran Mendalam';

export interface UserSettings {
  defaultTeacherName: string;
  defaultSchoolName: string;
  defaultAcademicYear: string;
  defaultLevel: string;
}

function currentAcademicYear(): string {
  const now = new Date();
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultTeacherName: '',
  defaultSchoolName: '',
  defaultAcademicYear: currentAcademicYear(),
  defaultLevel: '',
};

// Kept for API compatibility with existing dashboard state; production no longer seeds fake RPP data.
export const INITIAL_SAMPLE_RPPS: RPPData[] = [];

function safeParseRPPList(raw: string | null): RPPData[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RPPData[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id !== 'sample_rpp_1') : [];
  } catch (error) {
    console.error('Failed to parse saved RPPs:', error);
    return [];
  }
}

export function getSavedRPPs(): RPPData[] {
  if (typeof window === 'undefined') return [];
  const saved = safeParseRPPList(localStorage.getItem(RPP_STORAGE_KEY));
  localStorage.setItem(RPP_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function saveRPP(rpp: RPPData): RPPData[] {
  const current = getSavedRPPs();
  const updatedRPP = { ...rpp, updatedAt: new Date().toISOString() };
  const index = current.findIndex((item) => item.id === rpp.id);
  const updated = index >= 0 ? current.map((item, i) => (i === index ? updatedRPP : item)) : [updatedRPP, ...current];
  if (typeof window !== 'undefined') localStorage.setItem(RPP_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteRPP(id: string): RPPData[] {
  const updated = getSavedRPPs().filter((item) => item.id !== id);
  if (typeof window !== 'undefined') localStorage.setItem(RPP_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function duplicateRPP(id: string): RPPData[] {
  const current = getSavedRPPs();
  const target = current.find((item) => item.id === id);
  if (!target) return current;
  const copy: RPPData = {
    ...structuredClone(target),
    id: `rpp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    identity: { ...target.identity, topic: `${target.identity.topic} (Salinan)` },
    status: 'Draft',
  };
  return saveRPP(copy);
}

function sanitizeSettings(settings: UserSettings): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...settings,
    defaultTeacherName: settings.defaultTeacherName === LEGACY_FAKE_TEACHER ? '' : (settings.defaultTeacherName || ''),
    defaultSchoolName: settings.defaultSchoolName === LEGACY_FAKE_SCHOOL ? '' : (settings.defaultSchoolName || ''),
  };
}

export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = raw ? sanitizeSettings(JSON.parse(raw) as UserSettings) : DEFAULT_USER_SETTINGS;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window !== 'undefined') localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitizeSettings(settings)));
}
