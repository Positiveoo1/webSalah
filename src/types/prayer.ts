export type PrayerType =
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

export type PrayerTimes = Record<PrayerType, string>;

export type MadhhabType =
  | 'hanafi'
  | 'shafii'
  | 'maliki'
  | 'hanbali';

export type CalculationMethodType =
  | 'muslim_world_league'
  | 'egyptian'
  | 'karachi'
  | 'umm_al_qura'
  | 'dubai'
  | 'qatar'
  | 'kuwait'
  | 'singapore'
  | 'tehran'
  | 'turkey'
  | 'tunis';

export type Location = {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type Settings = {
  location: Location | null;
  madhhab: MadhhabType;
  calculationMethod: CalculationMethodType;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  language: string;
};

// Design preferences to support various screen sizes
export type ScreenSize = 'smartwatch' | 'mobile' | 'tablet' | 'desktop';
