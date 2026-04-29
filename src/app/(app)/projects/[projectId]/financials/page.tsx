import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FinancialsClient } from "@/components/project/financials-client";

export default async function FinancialsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, budgetTotal: true, budgetSpent: true },
  });
  if (!project) notFound();

  const entries = await prisma.financialEntry.findMany({
    where: { projectId },
    orderBy: { entryDate: "desc" },
  });

  // Group by category for chart
  const categoryMap: Record<string, { budgeted: number; actual: number }> = {};
  for (const entry of entries) {
    if (!categoryMap[entry.category]) categoryMap[entry.category] = { budgeted: 0, actual: 0 };
    if (entry.isExpense) categoryMap[entry.category].actual += Number(entry.amount);
  }

  const chartData = Object.entries(categoryMap).map(([category, values]) => ({
    category,
    name: category.charAt(0) + category.slice(1).toLowerCase(),
    budgeted: values.budgeted,
    actual: values.actual,
  }));

  const serializedEntries = entries.map((e) => ({
    ...e,
    amount: Number(e.amount),
    entryDate: e.entryDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <FinancialsClient
      budgetTotal={project.budgetTotal != null ? Number(project.budgetTotal) : null}
      budgetSpent={Number(project.budgetSpent)}
      chartData={chartData}
      entries={serializedEntries}
    />
  );
}
