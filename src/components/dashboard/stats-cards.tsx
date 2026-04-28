import { TrendingUp, DollarSign, AlertCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  activeProjects: number;
  totalBudget: number;
  openRFIs: number;
  overdueTasks: number;
}

export function StatsCards({ activeProjects, totalBudget, openRFIs, overdueTasks }: StatsCardsProps) {
  const stats = [
    {
      label: "Active Projects",
      value: activeProjects.toString(),
      icon: TrendingUp,
      iconClass: "text-blue-600 bg-blue-50",
      change: "+1 this quarter",
    },
    {
      label: "Total Budget",
      value: formatCurrency(totalBudget),
      icon: DollarSign,
      iconClass: "text-emerald-600 bg-emerald-50",
      change: "Across active jobs",
    },
    {
      label: "Open RFIs",
      value: openRFIs.toString(),
      icon: AlertCircle,
      iconClass: openRFIs > 2 ? "text-orange-600 bg-orange-50" : "text-slate-500 bg-slate-100",
      change: openRFIs > 0 ? `${openRFIs} need response` : "All clear",
    },
    {
      label: "Overdue Tasks",
      value: overdueTasks.toString(),
      icon: ClipboardList,
      iconClass: overdueTasks > 0 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50",
      change: overdueTasks > 0 ? "Action needed" : "On track",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
