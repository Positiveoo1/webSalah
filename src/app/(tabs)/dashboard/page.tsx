'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRAYER_TYPES } from '@/lib/prayer/types';
import { formatTime } from '@/lib/prayer/calculation';
import { useLocation, type Location } from '@/hooks/useLocation';
import { useNow } from '@/hooks/useNow';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useCountdown } from '@/hooks/useCountdown';
import { PrayerCard } from '@/components/prayer/PrayerCard';
import { CurrentPrayerHighlight } from '@/components/prayer/CurrentPrayerHighlight';
import { CurrentTimeDisplay } from '@/components/prayer/CurrentTimeDisplay';
import { HijriDateDisplay } from '@/components/calendar/HijriDateDisplay';
import { LocationSelectorButton } from '@/components/location/LocationSelectorButton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SettingsButton } from '@/components/ui/settings-button';

type LocationSearchProps = {
  query: string;
  results: Location[];
  isSearching: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onSelect: (location: Location) => void;
};

// Defined at module level: when it was declared inside Dashboard it was
// re-created on every render, so the input lost focus after each keystroke.
function LocationSearch({
  query,
  results,
  isSearching,
  error,
  onQueryChange,
  onSearch,
  onSelect,
}: LocationSearchProps) {
  return (
    <div className="mx-auto mt-6 w-full max-w-md space-y-3 text-left">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="City, country"
          aria-label="Search for a city"
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2"
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={isSearching || !query.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <button
              key={`${result.latitude}-${result.longitude}`}
              onClick={() => onSelect(result)}
              className="block w-full rounded border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {result.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { isLoading: isLocationLoading, getCurrentLocation, searchLocations, setLocation } =
    useLocation();
  const now = useNow();
  const { location, isReady, error, settings, prayerTimes, tomorrowFajr } = usePrayerTimes(now);
  const countdown = useCountdown(prayerTimes, tomorrowFajr, now);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (error) {
    return (
      <CenteredMessage>
        <div className="text-center max-w-xl">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Location Error</h2>
          <p className="mb-6 text-muted-foreground">{error.message}</p>
          <button onClick={getCurrentLocation} className="btn btn-outline">
            Try Again
          </button>
        </div>
      </CenteredMessage>
    );
  }

  if (!isReady || isLocationLoading) {
    return (
      <CenteredMessage>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Loading Prayer Times...</h2>
        </div>
      </CenteredMessage>
    );
  }

  if (!location) {
    return (
      <CenteredMessage>
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Web Salah</h1>
          <p className="text-lg text-muted-foreground">Accurate Islamic prayer times worldwide</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3">
            <button onClick={getCurrentLocation} className="btn btn-primary flex-1 sm:flex-none">
              Use My Location
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn btn-outline flex-1 sm:flex-none"
            >
              Search Location
            </button>
          </div>
          {isSearchOpen && (
            <LocationSearch
              query={searchQuery}
              results={searchResults}
              isSearching={isSearching}
              error={searchError}
              onQueryChange={setSearchQuery}
              onSearch={async () => {
                setIsSearching(true);
                setSearchError(null);
                try {
                  setSearchResults(await searchLocations(searchQuery));
                } catch (searchErr) {
                  setSearchError(searchErr instanceof Error ? searchErr.message : 'Search failed');
                } finally {
                  setIsSearching(false);
                }
              }}
              onSelect={(result) => {
                setLocation(result);
                setIsSearchOpen(false);
              }}
            />
          )}
        </div>
      </CenteredMessage>
    );
  }

  const tz = location.timezone;
  const nowMs = now?.getTime() ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-dvh bg-background"
    >
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-10">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Web Salah</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <LocationSelectorButton location={location} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <SettingsButton />
          </div>
        </header>

        {/* Current time + date */}
        <div className="mb-6 space-y-3 text-center">
          <CurrentTimeDisplay now={now} timezone={tz} timeFormat={settings.timeFormat} />
          <HijriDateDisplay now={now} timezone={tz} />
        </div>

        {/* Next prayer + minutes left */}
        {countdown && (
          <CurrentPrayerHighlight
            prayer={countdown.nextPrayer}
            prayerTime={formatTime(countdown.nextPrayerTime, tz, settings.timeFormat)}
            timeUntil={countdown.timeUntilNext}
            currentPrayer={countdown.currentPrayer}
          />
        )}

        {/* Prayer times grid */}
        {prayerTimes && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {PRAYER_TYPES.map((prayerType, index) => {
              const time = prayerTimes[prayerType];
              const isCurrent = countdown?.currentPrayer === prayerType;
              const isNext = countdown?.nextPrayer === prayerType;
              const isPassed = !isCurrent && !isNext && time.getTime() <= nowMs;

              return (
                <motion.div
                  key={prayerType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <PrayerCard
                    type={prayerType}
                    time={formatTime(time, tz, settings.timeFormat)}
                    isCurrent={isCurrent}
                    isNext={isNext}
                    isPassed={isPassed}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
