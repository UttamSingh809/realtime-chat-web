/**
 * SidebarFooter — current user + settings + logout.
 */

import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme';
import { useAuth, useLogout } from '@/features/auth';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export function SidebarFooter() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const avatar = (
    <Avatar className={cn('shrink-0', collapsed ? 'h-9 w-9' : 'h-9 w-9')}>
      {user.avatar?.url ? <AvatarImage src={user.avatar.url} alt={user.name} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );

  return (
    <div className="border-t p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-auto w-full justify-start gap-3 px-2 py-2',
              collapsed && 'justify-center px-0'
            )}
          >
            {avatar}
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="top" className="w-56">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!collapsed && (
        <div className="mt-2 flex items-center justify-end px-2">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
