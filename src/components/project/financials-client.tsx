"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, budgetPercentage } from "@/lib/utils";

interface ChartRow { category: string; name: string; budgeted: number; actual: number }
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
  budgetTotal: number | null;
  budgetSpent: number;
  chartData: ChartRow[];
  entries: Entry[];
}

export function FinancialsClient({ budgetTotal, budgetSpent, chartData, entries }: Props) {
  const budgetPct = budgetPercentage(budgetSpent, budgetTotal);
  const remaining = (budgetTotal ?? 0) - budgetSpent;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-base font-semibold text-foreground">Financials</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(budgetTotal)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Spent to Date</p>
            <p className={`text-xl font-bold ${budgetPct >= 85 ? "text-orange-600" : "text-foreground"}`}>
              {formatCurrency(budgetSpent)}
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

      {chartData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Actual Spend by Category
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
                <Bar dataKey="actual" name="Actual" fill="oklch(0.75 0.18 68)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
