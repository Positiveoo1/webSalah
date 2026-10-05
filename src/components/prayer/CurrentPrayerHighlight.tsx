'use client';

import { PRAYER_NAMES } from '@/lib/prayer/types';
import type { PrayerType } from '@/lib/prayer/types';
import { formatDuration, type CountdownTime } from '@/hooks/useCountdown';

interface CurrentPrayerHighlightProps {
  /** The next salah. */
  prayer: PrayerType;
  /** Start time of the next salah, already formatted. */
  prayerTime: string;
  timeUntil: CountdownTime;
  /** Salah whose window is currently running (if any). */
  currentPrayer: PrayerType | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function CurrentPrayerHighlight({
  prayer,
  prayerTime,
  timeUntil,
  currentPrayer,
}: CurrentPrayerHighlightProps) {
  return (
    <section
      aria-label="Next prayer"
      className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 py-6 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Next prayer</p>
          <h2 className="mt-1 text-4xl sm:text-5xl font-light tracking-tight text-foreground">
            {PRAYER_NAMES[prayer]}
          </h2>
        </div>
        <p className="text-3xl sm:text-4xl font-light tabular-nums text-muted-foreground">
          {prayerTime}
        </p>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 border-t border-primary/15 pt-5">
        <div>
          <p className="text-4xl sm:text-5xl font-semibold tabular-nums text-primary">
            {formatDuration(timeUntil)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">remaining</p>
        </div>
        <p
          className="font-mono text-lg sm:text-xl tabular-nums text-muted-foreground"
          aria-hidden
        >
          {pad(timeUntil.hours)}:{pad(timeUntil.minutes)}:{pad(timeUntil.seconds)}
        </p>
      </div>

      {currentPrayer && (
        <p className="mt-4 text-sm text-muted-foreground">
          Now: <span className="text-foreground">{PRAYER_NAMES[currentPrayer]}</span> time
        </p>
      )}
    </section>
  );
}
