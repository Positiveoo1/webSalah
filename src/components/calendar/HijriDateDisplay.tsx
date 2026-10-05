'use client';

interface HijriDateDisplayProps {
  now: Date | null;
  timezone: string;
}

/** Gregorian + Hijri (Umm al-Qura) date for the selected location, via native Intl. */
export function HijriDateDisplay({ now, timezone }: HijriDateDisplayProps) {
  if (!now) return <div className="h-12" aria-hidden />;

  const gregorian = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone: timezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <div className="space-y-1">
      <div className="text-xl font-light text-foreground">{gregorian}</div>
      <div className="text-sm text-muted-foreground">{hijri}</div>
    </div>
  );
}
