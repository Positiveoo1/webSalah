import { useState, useEffect, useCallback } from 'react';
import { getTimezoneForCoordinates } from '@/lib/location/timezone';

export type Location = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

const LOCATION_STORAGE_KEY = 'web-salah-location';
const LOCATION_CHANGE_EVENT = 'web-salah-location-change';

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  // false until localStorage has been read (prevents a flash of the "no location" screen)
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const readSavedLocation = () => {
      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!savedLocation) {
        setLocation(null);
        setIsReady(true);
        return;
      }

      try {
        const parsed: Location = JSON.parse(savedLocation);
        // Always re-derive the timezone from the coordinates: older saved
        // locations stored the *browser's* timezone, which gave wrong times.
        setLocation({
          ...parsed,
          timezone: getTimezoneForCoordinates(parsed.latitude, parsed.longitude),
        });
      } catch {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
        setError(new Error('Saved location data is invalid'));
      }
      setIsReady(true);
    };

    readSavedLocation();
    window.addEventListener(LOCATION_CHANGE_EVENT, readSavedLocation);
    window.addEventListener('storage', readSavedLocation);

    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, readSavedLocation);
      window.removeEventListener('storage', readSavedLocation);
    };
  }, []);

  const saveLocation = useCallback((newLocation: Location) => {
    const withTimezone: Location = {
      ...newLocation,
      timezone: getTimezoneForCoordinates(newLocation.latitude, newLocation.longitude),
    };
    setLocation(withTimezone);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(withTimezone));
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const timezone = getTimezoneForCoordinates(latitude, longitude);

          const newLocation: Location = {
            name: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            timezone,
          };

          saveLocation(newLocation);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to process location'));
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(new Error(err.message || 'Failed to get location'));
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }, [saveLocation]);

  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmedQuery)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      throw new Error('Unable to search for locations right now');
    }

    const results: Array<{
      display_name: string;
      lat: string;
      lon: string;
    }> = await response.json();

    return results.map((result) => ({
      name: result.display_name,
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      timezone: getTimezoneForCoordinates(Number(result.lat), Number(result.lon)),
    }));
  }, []);

  const setLocationManual = saveLocation;

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(null);
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  }, []);

  return {
    location,
    isLoading,
    isReady,
    error,
    getCurrentLocation,
    searchLocations,
    setLocation: setLocationManual,
    clearLocation,
  };
}