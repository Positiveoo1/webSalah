import tzlookup from 'tz-lookup';

/** Browser timezone, used only as a last-resort fallback. */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Resolve the IANA timezone of a coordinate (offline lookup).
 * Prayer times must be shown in the timezone of the *selected location*,
 * not the timezone of the device the app happens to run on.
 */
export function getTimezoneForCoordinates(latitude: number, longitude: number): string {
  try {
    return tzlookup(latitude, longitude);
  } catch {
    return getBrowserTimezone();
  }
}
