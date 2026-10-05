'use client';

import { MapPin } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

interface LocationSelectorButtonProps {
  location?: {
    name: string;
  };
}

export function LocationSelectorButton({ location }: LocationSelectorButtonProps) {
  const { getCurrentLocation, isLoading } = useLocation();

  return (
    <button
      onClick={getCurrentLocation}
      disabled={isLoading}
      className="flex max-w-[65vw] items-center gap-1.5 py-1 text-sm hover:text-foreground transition-colors disabled:opacity-50 sm:max-w-md"
    >
      <MapPin className="h-4 w-4 shrink-0" />
      <span className="truncate">{location?.name?.split(',').slice(0, 2).join(',') || 'Location unknown'}</span>
    </button>
  );
}