/**
 * SettingsPage — /app/settings/*
 *
 * Tabs:
 *   profile        → name, bio, phone, status message
 *   account        → email (ro), username (ro), password change
 *   privacy        → last seen, online status, read receipts, allow messages
 *   notifications  → message/mention/reaction/sound/email/push toggles
 *   appearance     → theme picker
 *   blocked        → blocked users list
 *   muted          → muted users list
 */

import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TABS = [
  { to: 'profile', label: 'Profile' },
  { to: 'account', label: 'Account' },
  { to: 'privacy', label: 'Privacy' },
  { to: 'notifications', label: 'Notifications' },
  { to: 'appearance', label: 'Appearance' },
  { to: 'blocked', label: 'Blocked users' },
  { to: 'muted', label: 'Muted chats' },
];

export default function SettingsPage() {
  return (
    <div className="flex h-full">
      {/* Left nav */}
      <nav className="hidden w-56 shrink-0 border-r p-3 md:block">
        <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Settings
        </h2>
        <ul className="space-y-0.5">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )
                }
              >
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-4 md:p-8">
          {/* Mobile tabs (horizontal scroll) */}
          <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:hidden">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-full border px-3 py-1 text-xs',
                    isActive
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground'
                  )
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

/**
 * Default redirect for /app/settings (bare) → /app/settings/profile
 * We export this as a helper component used in the route config.
 */
export function SettingsIndexRedirect() {
  return <Navigate to="profile" replace />;
}
