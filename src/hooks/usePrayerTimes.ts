import { useMemo } from 'react';
import {
  addDays,
  calculatePrayerSchedule,
  getDatePartsInZone,
  toDateKey,
  type PrayerSchedule,
} from '@/lib/prayer/calculation';
import { useLocation } from './useLocation';
import { useSettings } from './useSettings';

/**
 * Today's prayer schedule for the selected location, plus tomorrow's Fajr
 * (needed for the countdown after Isha).
 *
 * Everything is computed from the location's own calendar day and timezone,
 * and honours the madhhab / calculation method chosen in Settings.
 * `now` is only used to detect when the location's day changes (midnight there).
 */
export function usePrayerTimes(now: Date | null) {
  const { location, isReady, error } = useLocation();
  const { settings } = useSettings();

  const timezone = location?.timezone;
  const dayKey = now && timezone ? toDateKey(getDatePartsInZone(now, timezone)) : null;

  const schedule = useMemo(() => {
    if (!location || !now) return null;
    const today = getDatePartsInZone(now, location.timezone);
    const args = [settings.madhhab, settings.calculationMethod] as const;

    return {
      today: calculatePrayerSchedule(location.latitude, location.longitude, today, ...args),
      tomorrowFajr: calculatePrayerSchedule(
        location.latitude,
        location.longitude,
        addDays(today, 1),
        ...args
      ).fajr,
    };
    // `now` itself is intentionally not a dependency: recompute only when the
    // location, settings or the location's calendar day change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, settings.madhhab, settings.calculationMethod, dayKey]);

  return {
    location,
    isReady,
    error,
    settings,
    prayerTimes: (schedule?.today ?? null) as PrayerSchedule | null,
    tomorrowFajr: schedule?.tomorrowFajr ?? null,
  };
}
