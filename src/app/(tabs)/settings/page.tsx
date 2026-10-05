'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, MapPin, Monitor, Moon, Sun } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useSettings } from '@/hooks/useSettings';
import type { CalculationMethodType, MadhhabType } from '@/types/prayer';

const MADHHABS: { value: MadhhabType; label: string; hint: string }[] = [
  { value: 'hanafi', label: 'Hanafi', hint: 'Later Asr (shadow 2×)' },
  { value: 'shafii', label: "Shafi'i", hint: 'Earlier Asr (shadow 1×)' },
  { value: 'maliki', label: 'Maliki', hint: 'Earlier Asr (shadow 1×)' },
  { value: 'hanbali', label: 'Hanbali', hint: 'Earlier Asr (shadow 1×)' },
];

const METHODS: { value: CalculationMethodType; label: string }[] = [
  { value: 'muslim_world_league', label: 'Muslim World League' },
  { value: 'egyptian', label: 'Egyptian General Authority' },
  { value: 'karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'umm_al_qura', label: 'Umm al-Qura University, Makkah' },
  { value: 'dubai', label: 'Dubai' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'tehran', label: 'Tehran' },
  { value: 'turkey', label: 'Turkey (Diyanet)' },
  { value: 'tunis', label: 'Tunisia' },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Big, thumb-friendly segmented control. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-xl bg-muted/60 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
              selected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { location, clearLocation } = useLocation();
  const { settings, updateSettings } = useSettings();
  const { madhhab, calculationMethod, timeFormat, theme } = settings;

  // Settings apply immediately (the dashboard reads them live).
  useEffect(() => {
    const dark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    if (theme === 'system') localStorage.removeItem('web-salah-theme');
    else localStorage.setItem('web-salah-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-3">
          <Link
            href="/dashboard"
            aria-label="Back to prayer times"
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5">
        <Section title="Location">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="truncate">
                {location?.name?.split(',').slice(0, 2).join(',') || 'Not set'}
              </p>
            </div>
            <Link
              href="/dashboard"
              onClick={clearLocation}
              className="btn btn-outline min-h-11 shrink-0 text-sm"
            >
              Change
            </Link>
          </div>
          {location && (
            <p className="mt-2 text-xs text-muted-foreground">
              Timezone: {location.timezone.replace(/_/g, ' ')}
            </p>
          )}
        </Section>

        <Section title="Asr calculation" description="Which school’s rule is used for the Asr time.">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Madhhab">
            {MADHHABS.map((m) => {
              const selected = madhhab === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateSettings({ madhhab: m.value })}
                  className={`min-h-16 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 hover:bg-muted/50'
                  }`}
                >
                  <span className="block font-medium text-foreground">{m.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{m.hint}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Calculation method" description="Sets the Fajr and Isha angles.">
          <div className="relative">
            <select
              value={calculationMethod}
              onChange={(e) =>
                updateSettings({ calculationMethod: e.target.value as CalculationMethodType })
              }
              aria-label="Calculation method"
              className="min-h-12 w-full appearance-none rounded-xl border border-border bg-background py-2 pl-3 pr-10 text-foreground"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Section>

        <Section title="Time format">
          <Segmented
            label="Time format"
            value={timeFormat}
            onChange={(v) => updateSettings({ timeFormat: v })}
            options={[
              { value: '24h', label: '24-hour' },
              { value: '12h', label: '12-hour' },
            ]}
          />
        </Section>

        <Section title="Theme">
          <Segmented
            label="Theme"
            value={theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
              { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
              { value: 'system', label: 'Auto', icon: <Monitor className="h-4 w-4" /> },
            ]}
          />
        </Section>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          Changes are saved automatically.
        </p>
      </main>
    </div>
  );
}
