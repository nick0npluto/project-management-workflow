import { notFound } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, budgetPercentage } from "@/lib/utils";

const taskIconMap = {
  DONE: CheckCircle2,
  IN_PROGRESS: Clock,
  BLOCKED: XCircle,
  TODO: AlertCircle,
};
const taskColorMap = {
  DONE: "text-emerald-600",
  IN_PROGRESS: "text-blue-600",
  BLOCKED: "text-red-600",
  TODO: "text-slate-400",
};

export default async function OverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const [project, tasks, logs] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { manager: { select: { fullName: true } } },
    }),
    prisma.task.findMany({
      where: { projectId },
      include: { assignedTo: { select: { fullName: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.dailyLog.findMany({
      where: { projectId },
      include: { submittedBy: { select: { fullName: true } } },
      orderBy: { logDate: "desc" },
      take: 3,
    }),
  ]);

  if (!project) notFound();

  const budgetTotal = project.budgetTotal != null ? Number(project.budgetTotal) : null;
  const budgetSpent = Number(project.budgetSpent);
  const budgetPct = budgetPercentage(budgetSpent, budgetTotal);
  const openTasks = tasks.filter((t) => t.status !== "DONE");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Client</p>
              <p className="font-medium">{project.clientName ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Status</p>
              <StatusBadge type="project" value={project.status} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Start Date</p>
              <p className="font-medium">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Target Completion</p>
              <p className="font-medium">{formatDate(project.targetEndDate)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs mb-0.5">Address</p>
              <p className="font-medium">
                {[project.address, project.city, project.state].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
            {project.description && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-0.5">Description</p>
                <p className="text-sm leading-relaxed text-foreground/80">{project.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All tasks complete.</p>
            ) : (
              openTasks.map((task) => {
                const Icon = taskIconMap[task.status];
                const color = taskColorMap[task.status];
                return (
                  <div key={task.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge type="task" value={task.status} />
                        <StatusBadge type="priority" value={task.priority} />
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</span>
                        )}
                      </div>
                    </div>
                    {task.assignedTo && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                        {task.assignedTo.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{formatDate(log.logDate)}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.crewCount} crew · {log.weatherConditions} {log.temperatureF ? `${log.temperatureF}°F` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{log.workPerformed}</p>
                  {log.issues && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {log.issues}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Used</span>
                <span className={`font-semibold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
                  {budgetPct}%
                </span>
              </div>
              <Progress value={budgetPct} className={`h-2 ${budgetPct >= 85 ? "[&>div]:bg-orange-500" : ""}`} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-medium">{formatCurrency(budgetTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">{formatCurrency(budgetSpent)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency((budgetTotal ?? 0) - budgetSpent)}
                </span>
              </div>
            </div>
            {budgetPct >= 85 && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700">
                ⚠ Budget utilization is high. Review upcoming costs with the project controller.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
