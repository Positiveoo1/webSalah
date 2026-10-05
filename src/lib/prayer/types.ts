import type { PrayerType } from '@/types/prayer';

export type { PrayerType, PrayerTimes } from '@/types/prayer';

/** All entries shown on the dashboard, in chronological order. */
export const PRAYER_TYPES: readonly PrayerType[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

/** The five obligatory prayers (sunrise is only the end of Fajr, not a salah). */
export const SALAH_TYPES: readonly PrayerType[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const PRAYER_NAMES: Record<PrayerType, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PRAYER_ICONS: Record<PrayerType, string> = {
  fajr: 'moon',
  sunrise: 'sun',
  dhuhr: 'sun',
  asr: 'sun',
  maghrib: 'moon',
  isha: 'moon',
};
