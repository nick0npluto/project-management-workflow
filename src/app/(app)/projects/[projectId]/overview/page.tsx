import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TasksPanelClient } from "@/components/project/tasks-panel-client";
import { StatusBadge } from "@/components/shared/status-badge";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, budgetPercentage } from "@/lib/utils";

export default async function OverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const appUser = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true, role: true },
      })
    : null;

  const [project, tasks, logs, members] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { manager: { select: { id: true, fullName: true } } },
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
    prisma.projectMember.findMany({
      where: { projectId },
      select: { user: { select: { id: true, fullName: true } } },
    }),
  ]);

  if (!project) notFound();

  const budgetTotal = project.budgetTotal != null ? Number(project.budgetTotal) : null;
  const budgetSpent = Number(project.budgetSpent);
  const budgetPct = budgetPercentage(budgetSpent, budgetTotal);

  const assigneeMap = new Map<string, { id: string; fullName: string }>();
  assigneeMap.set(project.manager.id, project.manager);
  for (const member of members) assigneeMap.set(member.user.id, member.user);
  const assignees = Array.from(assigneeMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));

  const canCreateTask =
    appUser != null &&
    appUser.role !== "EXECUTIVE" &&
    (appUser.role === "ADMIN" ||
      appUser.id === project.manager.id ||
      members.some((member) => member.user.id === appUser.id));

  const serializedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    assignedTo: task.assignedTo,
  }));

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

        <TasksPanelClient
          projectId={projectId}
          initialTasks={serializedTasks}
          assignees={assignees}
          canCreate={canCreateTask}
        />

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
