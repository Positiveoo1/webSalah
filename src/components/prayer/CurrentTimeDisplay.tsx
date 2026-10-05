'use client';

import { formatTime } from '@/lib/prayer/calculation';

interface CurrentTimeDisplayProps {
  now: Date | null;
  timezone: string;
  timeFormat: '12h' | '24h';
}

/** Live clock (with seconds) in the selected location's timezone. */
export function CurrentTimeDisplay({ now, timezone, timeFormat }: CurrentTimeDisplayProps) {
  return (
    <div className="text-center">
      <div
        className="text-5xl sm:text-6xl font-light tabular-nums tracking-tight text-foreground"
        suppressHydrationWarning
      >
        {now ? formatTime(now, timezone, timeFormat, true) : '--:--:--'}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{timezone.replace(/_/g, ' ')} time</div>
    </div>
  );
}
