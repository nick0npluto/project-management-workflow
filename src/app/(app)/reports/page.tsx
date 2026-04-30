import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { BudgetChart } from "@/components/reports/budget-chart";
import { prisma } from "@/lib/prisma";
import { formatCurrency, budgetPercentage } from "@/lib/utils";

export default async function ReportsPage() {
  const [projects, rfiCounts, overdueTasks] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        budgetTotal: true,
        budgetSpent: true,
        completionPct: true,
      },
      orderBy: { budgetTotal: "desc" },
    }),
    prisma.rFI.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.task.count({
      where: { status: { not: "DONE" }, dueDate: { lt: new Date() } },
    }),
  ]);

  const portfolioBudget = projects.reduce((s, p) => s + Number(p.budgetTotal ?? 0), 0);
  const portfolioSpent = projects.reduce((s, p) => s + Number(p.budgetSpent), 0);
  const openRFIs = rfiCounts
    .filter((r) => r.status === "OPEN")
    .reduce((s, r) => s + r._count.id, 0);

  const rfiStatusMap: Record<string, number> = {};
  for (const r of rfiCounts) rfiStatusMap[r.status] = r._count.id;

  const chartProjects = projects
    .filter((p) => p.budgetTotal != null)
    .map((p) => ({
      name: p.name,
      shortName: p.name.split(" ").slice(0, 2).join(" "),
      budgetTotal: Number(p.budgetTotal),
      budgetSpent: Number(p.budgetSpent),
      status: p.status,
    }));

  const portfolioPct = budgetPercentage(portfolioSpent, portfolioBudget);

  const rfiStatuses: Array<{ key: string; label: string; color: string }> = [
    { key: "OPEN",      label: "Open",      color: "text-red-600 bg-red-50 border-red-100" },
    { key: "IN_REVIEW", label: "In Review", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
    { key: "ANSWERED",  label: "Answered",  color: "text-blue-600 bg-blue-50 border-blue-100" },
    { key: "CLOSED",    label: "Closed",    color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reports" subtitle="Portfolio analytics and project summaries" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-6xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Portfolio Budget", value: formatCurrency(portfolioBudget), sub: `${projects.length} projects` },
            { label: "Total Spent",      value: formatCurrency(portfolioSpent),  sub: `${portfolioPct}% utilized`, alert: portfolioPct >= 85 },
            { label: "Open RFIs",        value: String(openRFIs),               sub: "New / unassigned" },
            { label: "Overdue Tasks",    value: String(overdueTasks),            sub: "Past due date", alert: overdueTasks > 0 },
          ].map(({ label, value, sub, alert }) => (
            <Card key={label} className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${alert ? "text-orange-600" : "text-foreground"}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Budget Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Budget vs. Spent by Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetChart projects={chartProjects} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RFI Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                RFI Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rfiStatuses.map(({ key, label, color }) => {
                const count = rfiStatusMap[key] ?? 0;
                const total = Object.values(rfiStatusMap).reduce((s, v) => s + v, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-24 justify-center ${color}`}>
                      {label}
                    </span>
                    <div className="flex-1">
                      <Progress value={pct} className="h-2" />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Project Completion Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Project Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Project</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground w-28">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground w-20">Done</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground w-20">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const bPct = budgetPercentage(Number(p.budgetSpent), Number(p.budgetTotal ?? 0));
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-3 font-medium text-foreground">
                          <span className="line-clamp-1">{p.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge type="project" value={p.status} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-foreground">
                          {p.completionPct}%
                        </td>
                        <td className={`px-5 py-3 text-right font-medium ${bPct >= 85 ? "text-orange-600" : "text-muted-foreground"}`}>
                          {bPct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
