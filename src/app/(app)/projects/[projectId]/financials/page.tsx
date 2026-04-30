import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { FinancialsClient } from "@/components/project/financials-client";

export default async function FinancialsPage({ params }: { params: Promise<{ projectId: string }> }) {
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

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, managerId: true, status: true, completionPct: true, budgetTotal: true, budgetSpent: true },
  });
  if (!project) notFound();

  const canUpdateBudget =
    appUser != null &&
    (appUser.role === "ADMIN" || (appUser.role === "PROJECT_MANAGER" && project.managerId === appUser.id));

  const entries = await prisma.financialEntry.findMany({
    where: { projectId },
    orderBy: { entryDate: "desc" },
  });

  // Group by category for charts + variance table.
  const categoryMap: Record<string, { actual: number; income: number }> = {};
  for (const entry of entries) {
    if (!categoryMap[entry.category]) categoryMap[entry.category] = { actual: 0, income: 0 };
    if (entry.isExpense) categoryMap[entry.category].actual += Number(entry.amount);
    else categoryMap[entry.category].income += Number(entry.amount);
  }

  const totalBudget = project.budgetTotal != null ? Number(project.budgetTotal) : null;
  const categoryBudgetWeights: Record<string, number> = {
    LABOR: 0.3,
    MATERIALS: 0.2,
    EQUIPMENT: 0.1,
    SUBCONTRACTOR: 0.3,
    OVERHEAD: 0.08,
    OTHER: 0.02,
  };

  const chartData = Object.entries(categoryMap).map(([category, values]) => ({
    category,
    name: category.charAt(0) + category.slice(1).toLowerCase(),
    budgeted: totalBudget != null ? Math.round(totalBudget * (categoryBudgetWeights[category] ?? 0)) : 0,
    actual: values.actual,
  }));

  const varianceRows = chartData.map((row) => {
    const remaining = row.budgeted - row.actual;
    const utilization = row.budgeted > 0 ? Math.round((row.actual / row.budgeted) * 100) : 0;
    return {
      ...row,
      remaining,
      utilization,
      atRisk: utilization >= 85,
    };
  });

  // Last 6 months cash flow trend.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });
  const monthMap: Record<string, { expenses: number; income: number }> = Object.fromEntries(
    months.map((m) => [m.key, { expenses: 0, income: 0 }])
  );

  for (const entry of entries) {
    const key = `${entry.entryDate.getFullYear()}-${String(entry.entryDate.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) continue;
    if (entry.isExpense) monthMap[key].expenses += Number(entry.amount);
    else monthMap[key].income += Number(entry.amount);
  }

  const monthlyTrend = months.map((m) => ({
    month: m.label,
    expenses: monthMap[m.key].expenses,
    income: monthMap[m.key].income,
  }));

  const expenseTotal = entries
    .filter((entry) => entry.isExpense)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const committedCosts = Math.max(Number(project.budgetSpent), expenseTotal);
  const remainingCommitment = (totalBudget ?? 0) - committedCosts;
  const forecastAtCompletion =
    project.completionPct > 0 ? Number(project.budgetSpent) / (project.completionPct / 100) : null;

  const serializedEntries = entries.map((e) => ({
    ...e,
    amount: Number(e.amount),
    entryDate: e.entryDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <FinancialsClient
      projectStatus={project.status}
      completionPct={project.completionPct}
      projectId={projectId}
      canUpdateBudget={canUpdateBudget}
      budgetTotal={totalBudget}
      budgetSpent={Number(project.budgetSpent)}
      committedCosts={committedCosts}
      remainingCommitment={remainingCommitment}
      forecastAtCompletion={forecastAtCompletion}
      chartData={chartData}
      varianceRows={varianceRows}
      monthlyTrend={monthlyTrend}
      entries={serializedEntries}
    />
  );
}
