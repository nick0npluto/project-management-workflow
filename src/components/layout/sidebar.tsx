"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Settings,
  Shield,
  HardHat,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects",  href: "/projects",  icon: FolderOpen },
  { label: "Reports",   href: "/reports",   icon: BarChart3 },
  { label: "Admin",     href: "/admin",     icon: Shield },
  { label: "Settings",  href: "/settings",  icon: Settings },
];

const roleLabel: Record<string, string> = {
  EXECUTIVE: "Executive",
  PROJECT_MANAGER: "Project Manager",
  FIELD_SUPERVISOR: "Field Supervisor",
  ADMIN: "Admin / Accounting",
};

interface SidebarUser {
  fullName: string;
  role: string;
  title: string | null;
}

interface SidebarProps {
  onNavigate?: () => void;
  user?: SidebarUser | null;
}

export function Sidebar({ onNavigate, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
          <HardHat className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">ProConstruct</span>
          <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Cornerstone</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4 shrink-0">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName ?? "Loading..."}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user ? (user.title ?? roleLabel[user.role] ?? user.role) : ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
