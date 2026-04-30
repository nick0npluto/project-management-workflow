"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, budgetPercentage } from "@/lib/utils";

interface ChartRow { category: string; name: string; budgeted: number; actual: number }
interface VarianceRow extends ChartRow {
  remaining: number;
  utilization: number;
  atRisk: boolean;
}
interface MonthlyRow {
  month: string;
  expenses: number;
  income: number;
}
interface Entry {
  id: string;
  category: string;
  description: string;
  amount: number;
  isExpense: boolean;
  entryDate: string;
  vendor: string | null;
  invoiceNumber: string | null;
}

interface Props {
  projectStatus: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  completionPct: number;
  projectId: string;
  canUpdateBudget: boolean;
  budgetTotal: number | null;
  budgetSpent: number;
  committedCosts: number;
  remainingCommitment: number;
  forecastAtCompletion: number | null;
  chartData: ChartRow[];
  varianceRows: VarianceRow[];
  monthlyTrend: MonthlyRow[];
  entries: Entry[];
}

export function FinancialsClient({
  projectStatus,
  completionPct,
  projectId,
  canUpdateBudget,
  budgetTotal,
  budgetSpent,
  committedCosts,
  remainingCommitment,
  forecastAtCompletion,
  chartData,
  varianceRows,
  monthlyTrend,
  entries,
}: Props) {
  const router = useRouter();
  const [editingSpent, setEditingSpent] = useState(false);
  const [nextSpent, setNextSpent] = useState(String(Math.round(budgetSpent)));
  const [savingSpent, setSavingSpent] = useState(false);
  const [budgetError, setBudgetError] = useState("");

  const budgetPct = budgetPercentage(budgetSpent, budgetTotal);
  const remaining = (budgetTotal ?? 0) - budgetSpent;
  const forecastVariance = forecastAtCompletion != null && budgetTotal != null
    ? forecastAtCompletion - budgetTotal
    : null;
  const activeFinancials = projectStatus === "ACTIVE";

  async function saveSpentToDate() {
    const parsed = Number(nextSpent);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setBudgetError("Enter a valid non-negative amount.");
      return;
    }

    setBudgetError("");
    setSavingSpent(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetSpent: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBudgetError(data.error ?? "Failed to update spent amount.");
        return;
      }
      setEditingSpent(false);
      router.refresh();
    } catch {
      setBudgetError("Failed to update spent amount.");
    } finally {
      setSavingSpent(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-foreground">Financials</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(budgetTotal)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Spent to Date</p>
            <div className="space-y-2">
              <p className={`text-xl font-bold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
                {formatCurrency(budgetSpent)}
              </p>
              {canUpdateBudget && (
                <div className="space-y-2">
                  {editingSpent ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={nextSpent}
                        onChange={(e) => setNextSpent(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="h-7 text-xs" onClick={saveSpentToDate} disabled={savingSpent}>
                          {savingSpent ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            setEditingSpent(false);
                            setNextSpent(String(Math.round(budgetSpent)));
                            setBudgetError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setEditingSpent(true)}>
                      Update Spent So Far
                    </Button>
                  )}
                  {budgetError && <p className="text-xs text-destructive">{budgetError}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Committed Costs</p>
            <p className={`text-xl font-bold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
              {formatCurrency(committedCosts)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className={`text-xl font-bold ${remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(remaining)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget utilization</span>
            <span className={`font-semibold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
              {budgetPct}%
            </span>
          </div>
          <Progress value={budgetPct} className={`h-3 ${budgetPct >= 85 ? "[&>div]:bg-orange-500" : ""}`} />
          {budgetPct >= 85 && (
            <p className="text-xs text-orange-600">
              ⚠ High utilization — review with project controller before next billing cycle.
            </p>
          )}
        </CardContent>
      </Card>

      {activeFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="shadow-sm lg:col-span-1">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Remaining Commitment</p>
              <p className={`text-xl font-bold ${remainingCommitment < 0 ? "text-red-600" : "text-foreground"}`}>
                {formatCurrency(remainingCommitment)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm lg:col-span-1">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Forecast at Completion (EAC)</p>
              <p className="text-xl font-bold text-foreground">
                {forecastAtCompletion != null ? formatCurrency(forecastAtCompletion) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm lg:col-span-1">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Forecast Variance</p>
              <p
                className={`text-xl font-bold ${
                  forecastVariance == null
                    ? "text-foreground"
                    : forecastVariance > 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {forecastVariance != null ? formatCurrency(forecastVariance) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Budget vs Actual by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={32} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="budgeted" name="Budget Target" fill="oklch(0.55 0.12 252)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="oklch(0.75 0.18 68)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {monthlyTrend.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Monthly Cost Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}k`
                  }
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="oklch(0.75 0.18 68)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="income" name="Billings / Income" stroke="oklch(0.65 0.16 145)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {varianceRows.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cost Variance by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Budget</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Actual</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Remaining</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {varianceRows.map((row) => (
                  <tr key={row.category} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-foreground">{row.name}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{formatCurrency(row.budgeted)}</td>
                    <td className="px-5 py-3 text-right text-foreground">{formatCurrency(row.actual)}</td>
                    <td className={`px-5 py-3 text-right ${row.remaining < 0 ? "text-red-600" : "text-foreground"}`}>
                      {formatCurrency(row.remaining)}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${row.atRisk ? "text-orange-600" : "text-muted-foreground"}`}>
                      {row.utilization}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {!activeFinancials && (
        <p className="text-xs text-muted-foreground">
          This project is currently {projectStatus.toLowerCase().replace("_", " ")}. Forecast-focused widgets are
          optimized for active execution and will populate naturally as financial activity increases.
        </p>
      )}

      {entries.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Vendor
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(entry.entryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-foreground">{entry.description}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                      {entry.vendor ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground capitalize">
                      {entry.category.charAt(0) + entry.category.slice(1).toLowerCase()}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${entry.isExpense ? "text-foreground" : "text-emerald-600"}`}>
                      {entry.isExpense ? "" : "+"}{formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
