import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes as AdhanPrayerTimes,
  type CalculationParameters,
} from 'adhan';
import type { CalculationMethodType, MadhhabType, PrayerType } from '@/types/prayer';

/** Exact moments (absolute Date objects) of every prayer for one day. */
export type PrayerSchedule = Record<PrayerType, Date>;

export type YMD = { year: number; month: number; day: number };

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(key: string, options: Intl.DateTimeFormatOptions, locale = 'en-GB') {
  const cacheKey = `${locale}|${key}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(cacheKey, formatter);
  }
  return formatter;
}

/** Calendar date (year/month/day) of `date` as seen in `timezone`. */
export function getDatePartsInZone(date: Date, timezone: string): YMD {
  const parts = getFormatter(timezone, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

export function addDays({ year, month, day }: YMD, days: number): YMD {
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function toDateKey({ year, month, day }: YMD): string {
  return `${year}-${month}-${day}`;
}

function getCalculationParameters(
  method: CalculationMethodType,
  madhhab: MadhhabType,
  coordinates: Coordinates
): CalculationParameters {
  let params: CalculationParameters;

  switch (method) {
    case 'egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'umm_al_qura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'tehran':
      params = CalculationMethod.Tehran();
      break;
    case 'turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'tunis':
      // adhan has no built-in Tunisia preset: Fajr 18° / Isha 18°
      params = CalculationMethod.Other();
      params.fajrAngle = 18;
      params.ishaAngle = 18;
      break;
    case 'muslim_world_league':
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }

  // Only the Hanafi school uses the later (2x shadow) Asr; the others use 1x.
  params.madhab = madhhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  // Without this, places like Warsaw get unrealistic Fajr/Isha in summer.
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);

  return params;
}

/**
 * Prayer times for the calendar day `day` *at the given location*.
 * adhan reads the year/month/day from the Date's local components, so we build
 * the Date from the location's own calendar day (not from the device's clock).
 */
export function calculatePrayerSchedule(
  latitude: number,
  longitude: number,
  day: YMD,
  madhhab: MadhhabType = 'hanafi',
  method: CalculationMethodType = 'muslim_world_league'
): PrayerSchedule {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParameters(method, madhhab, coordinates);
  const times = new AdhanPrayerTimes(
    coordinates,
    new Date(day.year, day.month - 1, day.day),
    params
  );

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

/** Format an instant in the location's timezone. */
export function formatTime(
  date: Date,
  timezone: string,
  format: '12h' | '24h' = '24h',
  withSeconds = false
): string {
  return getFormatter(
    `time-${format}-${withSeconds}`,
    {
      timeZone: timezone,
      hour: format === '24h' ? '2-digit' : 'numeric',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' as const } : {}),
      hourCycle: format === '24h' ? 'h23' : 'h12',
    },
    format === '24h' ? 'en-GB' : 'en-US'
  ).format(date);
}
