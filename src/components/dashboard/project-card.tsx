import Link from "next/link";
import { MapPin, Calendar, Users, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, budgetPercentage } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    projectNumber: string | null;
    name: string;
    status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    city: string | null;
    state: string | null;
    clientName: string | null;
    targetEndDate: Date | null;
    budgetTotal: number | null;
    budgetSpent: number;
    completionPct: number;
    manager: { fullName: string; avatarUrl: string | null };
    _count?: { rfis: number; tasks: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const budgetPct = budgetPercentage(project.budgetSpent, project.budgetTotal);
  const budgetAtRisk = budgetPct >= 85 && project.status === "ACTIVE";

  return (
    <Link href={`/projects/${project.id}/overview`}>
      <Card className="group h-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-5 flex flex-col gap-4 h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {project.projectNumber && (
                  <span className="text-xs font-mono text-muted-foreground">{project.projectNumber}</span>
                )}
                <StatusBadge type="project" value={project.status} />
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                {project.name}
              </h3>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {(project.city || project.state) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{[project.city, project.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {project.clientName && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{project.clientName}</span>
              </div>
            )}
            {project.targetEndDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Due {formatDate(project.targetEndDate)}</span>
              </div>
            )}
          </div>

          {/* Completion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium text-foreground">{project.completionPct}%</span>
            </div>
            <Progress value={project.completionPct} className="h-1.5" />
          </div>

          {/* Budget */}
          {project.budgetTotal != null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Budget used</span>
                <span className={`font-medium ${budgetAtRisk ? "text-orange-600" : "text-foreground"}`}>
                  {budgetPct}%
                  {budgetAtRisk && " ⚠"}
                </span>
              </div>
              <Progress
                value={budgetPct}
                className={`h-1.5 ${budgetAtRisk ? "[&>div]:bg-orange-500" : ""}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(project.budgetSpent)} spent</span>
                <span>{formatCurrency(project.budgetTotal)} total</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {project.manager.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            {project._count && project._count.rfis > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{project._count.rfis} open RFI{project._count.rfis !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
