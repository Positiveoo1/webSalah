'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export function SettingsButton() {
  return (
    <Link
      href="/settings"
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-colors hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Settings"
    >
      <Settings className="w-5 h-5" />
    </Link>
  );
}
