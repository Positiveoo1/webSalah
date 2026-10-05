import { useEffect, useState } from 'react';

/**
 * Ticking clock (every second). Returns null on the server / first render so
 * server and client markup match (avoids hydration mismatch).
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0); // async, so no synchronous setState in the effect
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
