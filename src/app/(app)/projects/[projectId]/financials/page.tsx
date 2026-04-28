"use client";

import { use } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, budgetPercentage } from "@/lib/utils";
import { mockProjects, mockFinancials } from "@/lib/mock-data";

export default function FinancialsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0];
  const data = projectId === "proj-001" ? mockFinancials : [];
  const budgetPct = budgetPercentage(project.budgetSpent, project.budgetTotal);

  const chartData = data.map((d) => ({
    name: d.category.charAt(0) + d.category.slice(1).toLowerCase(),
    Budgeted: d.budgeted,
    Actual: d.actual,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-base font-semibold text-foreground">Financials</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(project.budgetTotal)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Spent to Date</p>
            <p className={`text-xl font-bold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
              {formatCurrency(project.budgetSpent)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency((project.budgetTotal ?? 0) - Number(project.budgetSpent))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget utilization</span>
            <span className={`font-semibold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>{budgetPct}%</span>
          </div>
          <Progress value={budgetPct} className={`h-3 ${budgetPct >= 85 ? "[&>div]:bg-orange-500" : ""}`} />
          {budgetPct >= 85 && (
            <p className="text-xs text-orange-600">⚠ High utilization — review with project controller before next billing cycle.</p>
          )}
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Budget vs. Actual by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budgeted" fill="oklch(0.55 0.12 252)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="oklch(0.75 0.18 68)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Budgeted</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Actual</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Variance</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const variance = row.budgeted - row.actual;
                  return (
                    <tr key={row.category} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium text-foreground capitalize">
                        {row.category.charAt(0) + row.category.slice(1).toLowerCase()}
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{formatCurrency(row.budgeted)}</td>
                      <td className="px-5 py-3 text-right text-foreground font-medium">{formatCurrency(row.actual)}</td>
                      <td className={`px-5 py-3 text-right font-medium ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
