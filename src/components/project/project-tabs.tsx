"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview",   segment: "overview" },
  { label: "Daily Logs", segment: "daily-logs" },
  { label: "RFIs",       segment: "rfis" },
  { label: "Documents",  segment: "documents" },
  { label: "Financials", segment: "financials" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
      {TABS.map(({ label, segment }) => {
        const href = `/projects/${projectId}/${segment}`;
        const active = pathname === href;
        return (
          <Link
            key={segment}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
