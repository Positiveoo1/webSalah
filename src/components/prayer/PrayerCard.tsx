'use client';

import { PRAYER_NAMES, PRAYER_ICONS } from '@/lib/prayer/types';
import type { PrayerType } from '@/lib/prayer/types';

interface PrayerCardProps {
  type: PrayerType;
  time: string;
  isCurrent?: boolean;
  isNext?: boolean;
  isPassed?: boolean;
}

const iconMap: Record<string, string> = { moon: '☾', sun: '☀' };

export function PrayerCard({
  type,
  time,
  isCurrent = false,
  isNext = false,
  isPassed = false,
}: PrayerCardProps) {
  const status = isCurrent ? 'Now' : isNext ? 'Next' : null;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
        isCurrent
          ? 'border-primary/50 bg-primary/10'
          : isNext
          ? 'border-primary/30 bg-primary/5'
          : isPassed
          ? 'border-border/40 bg-muted/20 opacity-55'
          : 'border-border/60 bg-card/80'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
          <span aria-hidden className="text-muted-foreground">
            {iconMap[PRAYER_ICONS[type]]}
          </span>
          {PRAYER_NAMES[type]}
        </h3>
        {status && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            {status}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-light tabular-nums text-foreground">{time}</p>
    </div>
  );
}
