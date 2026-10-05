import { useMemo } from 'react';
import type { PrayerSchedule } from '@/lib/prayer/calculation';
import { SALAH_TYPES } from '@/lib/prayer/types';
import type { PrayerType } from '@/types/prayer';

export type CountdownTime = {
  hours: number;
  minutes: number;
  seconds: number;
  /** Whole minutes remaining (floor). */
  totalMinutes: number;
};

export type CountdownState = {
  /** The salah that starts next (Fajr tomorrow after Isha). */
  nextPrayer: PrayerType;
  nextPrayerTime: Date;
  timeUntilNext: CountdownTime;
  /** The salah whose time window we are currently in (null between sunrise and Dhuhr). */
  currentPrayer: PrayerType | null;
};

/**
 * Pure calculation based on real instants (Date), so it is correct regardless
 * of the device timezone and works across midnight.
 */
export function useCountdown(
  prayerTimes: PrayerSchedule | null,
  tomorrowFajr: Date | null,
  now: Date | null
): CountdownState | null {
  return useMemo(() => {
    if (!prayerTimes || !tomorrowFajr || !now) return null;
    const nowMs = now.getTime();

    // Next salah: first one strictly in the future, otherwise tomorrow's Fajr.
    let nextPrayer: PrayerType = 'fajr';
    let nextPrayerTime = tomorrowFajr;
    for (const type of SALAH_TYPES) {
      if (prayerTimes[type].getTime() > nowMs) {
        nextPrayer = type;
        nextPrayerTime = prayerTimes[type];
        break;
      }
    }

    // Current salah window.
    let currentPrayer: PrayerType | null = null;
    if (nowMs < prayerTimes.fajr.getTime()) {
      currentPrayer = 'isha'; // still in last night's Isha window
    } else if (nowMs < prayerTimes.sunrise.getTime()) {
      currentPrayer = 'fajr';
    } else if (nowMs < prayerTimes.dhuhr.getTime()) {
      currentPrayer = null; // after sunrise, before Dhuhr
    } else if (nowMs < prayerTimes.asr.getTime()) {
      currentPrayer = 'dhuhr';
    } else if (nowMs < prayerTimes.maghrib.getTime()) {
      currentPrayer = 'asr';
    } else if (nowMs < prayerTimes.isha.getTime()) {
      currentPrayer = 'maghrib';
    } else {
      currentPrayer = 'isha';
    }

    const totalSeconds = Math.max(0, Math.floor((nextPrayerTime.getTime() - nowMs) / 1000));
    const timeUntilNext: CountdownTime = {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      totalMinutes: Math.floor(totalSeconds / 60),
    };

    return { nextPrayer, nextPrayerTime, timeUntilNext, currentPrayer };
  }, [prayerTimes, tomorrowFajr, now]);
}

/** "6h 15m", "45m", "Less than 1m" — hours + minutes instead of raw minutes. */
export function formatDuration({ hours, minutes, totalMinutes }: CountdownTime): string {
  if (totalMinutes < 1) return '< 1m';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
