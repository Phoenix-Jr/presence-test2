'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  Church,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Members', href: '/members', icon: Users },
  { title: 'Attendance', href: '/attendance', icon: UserCheck },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, role } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.replace('/login');
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar px-3 py-5">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Church className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-sidebar-foreground">
          Presense
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-primary-foreground' : ''
                )}
              />
              {item.title}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-1 pt-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold capitalize">
              {role?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate capitalize text-sidebar-foreground">
              {role ?? 'Guest'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {role}@presense.app
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
