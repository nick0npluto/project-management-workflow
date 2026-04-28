"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects",  href: "/projects",  icon: FolderOpen },
  { label: "Reports",   href: "/reports",   icon: BarChart3 },
  { label: "Settings",  href: "/settings",  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden">
      {mobileNav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
