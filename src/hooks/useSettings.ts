import { useCallback, useEffect, useState } from 'react';
import type { CalculationMethodType, MadhhabType } from '@/types/prayer';

export type AppSettings = {
  madhhab: MadhhabType;
  calculationMethod: CalculationMethodType;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
};

export const SETTINGS_STORAGE_KEY = 'web-salah-settings';
const SETTINGS_CHANGE_EVENT = 'web-salah-settings-change';

export const DEFAULT_SETTINGS: AppSettings = {
  madhhab: 'hanafi',
  calculationMethod: 'muslim_world_league',
  timeFormat: '24h',
  theme: 'system',
};

function readSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Settings persisted in localStorage and shared between all hook instances. */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const sync = () => setSettings(readSettings());
    sync();
    window.addEventListener(SETTINGS_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...readSettings(), ...patch };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
  }, []);

  return { settings, updateSettings };
}
