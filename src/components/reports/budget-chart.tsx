"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ProjectBudget {
  name: string;
  shortName: string;
  budgetTotal: number;
  budgetSpent: number;
  status: string;
}

export function BudgetChart({ projects }: { projects: ProjectBudget[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={projects} barSize={24} barGap={4} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
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
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="budgetTotal" name="Budget" fill="oklch(0.55 0.12 252)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="budgetSpent" name="Spent" radius={[4, 4, 0, 0]}>
          {projects.map((p, i) => {
            const pct = p.budgetTotal > 0 ? p.budgetSpent / p.budgetTotal : 0;
            const color = pct >= 0.85 ? "oklch(0.65 0.18 38)" : "oklch(0.75 0.18 68)";
            return <Cell key={i} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
