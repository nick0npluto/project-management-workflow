"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_FILTERS = ["All", "Active", "Planning", "On Hold", "Completed"] as const;
type FilterValue = (typeof STATUS_FILTERS)[number];

const filterMap: Record<FilterValue, string | null> = {
  All: null,
  Active: "ACTIVE",
  Planning: "PLANNING",
  "On Hold": "ON_HOLD",
  Completed: "COMPLETED",
};

interface Project {
  id: string;
  projectNumber: string | null;
  name: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  city: string | null;
  state: string | null;
  clientName: string | null;
  targetEndDate: Date | null;
  budgetTotal: unknown;
  budgetSpent: unknown;
  completionPct: number;
  manager: { id: string; fullName: string; avatarUrl: string | null };
  _count: { rfis: number; tasks: number; dailyLogs: number };
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [search, setSearch] = useState("");

  const serialized = projects.map((p) => ({
    ...p,
    budgetTotal: p.budgetTotal != null ? Number(p.budgetTotal) : null,
    budgetSpent: Number(p.budgetSpent),
    targetEndDate: p.targetEndDate ? new Date(p.targetEndDate) : null,
  }));

  const filteredSerialized = serialized.filter((p) => {
    if (filterMap[filter] && p.status !== filterMap[filter]) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-base font-semibold text-foreground flex-1">Projects</h2>
        <input
          type="text"
          placeholder="Filter projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full sm:w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
            {f === "All" && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {projects.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredSerialized.length === 0 ? (
        <EmptyState
          variant="projects"
          title="No projects match this filter"
          description="Try a different status filter or clear your search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSerialized.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
