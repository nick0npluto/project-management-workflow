"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockProjects } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const TABS = [
  { label: "Overview",    segment: "overview" },
  { label: "Daily Logs",  segment: "daily-logs" },
  { label: "RFIs",        segment: "rfis" },
  { label: "Documents",   segment: "documents" },
  { label: "Financials",  segment: "financials" },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0];

  return (
    <div className="flex flex-col flex-1">
      {/* Project Header */}
      <div className="border-b border-border bg-card px-6 pt-5 pb-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {project.projectNumber && (
                <span className="text-xs font-mono text-muted-foreground">{project.projectNumber}</span>
              )}
              <StatusBadge type="project" value={project.status} />
            </div>
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              {(project.city || project.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[project.city, project.state].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {project.manager.fullName}
              </span>
              {project.targetEndDate && (
                <span>Due {formatDate(project.targetEndDate)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold text-foreground">{project.completionPct}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{project._count?.rfis ?? 0}</p>
              <p className="text-xs text-muted-foreground">Open RFIs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{project._count?.tasks ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <nav className="flex items-center gap-1 -mb-px">
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
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
