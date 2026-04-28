import { cn } from "@/lib/utils";

type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
type RFIStatus = "OPEN" | "IN_REVIEW" | "ANSWERED" | "CLOSED";
type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  ACTIVE:    { label: "Active",     className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  PLANNING:  { label: "Planning",   className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  ON_HOLD:   { label: "On Hold",    className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  COMPLETED: { label: "Completed",  className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  CANCELLED: { label: "Cancelled",  className: "bg-red-50 text-red-600 ring-red-600/20" },
};

const rfiStatusConfig: Record<RFIStatus, { label: string; className: string }> = {
  OPEN:      { label: "Open",      className: "bg-red-50 text-red-700 ring-red-600/20" },
  IN_REVIEW: { label: "In Review", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  ANSWERED:  { label: "Answered",  className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  CLOSED:    { label: "Closed",    className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO:        { label: "To Do",       className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  BLOCKED:     { label: "Blocked",     className: "bg-red-50 text-red-700 ring-red-600/20" },
  DONE:        { label: "Done",        className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW:    { label: "Low",    className: "bg-slate-100 text-slate-500 ring-slate-400/20" },
  MEDIUM: { label: "Medium", className: "bg-blue-50 text-blue-600 ring-blue-500/20" },
  HIGH:   { label: "High",   className: "bg-orange-50 text-orange-700 ring-orange-600/20" },
  URGENT: { label: "Urgent", className: "bg-red-50 text-red-700 ring-red-600/20" },
};

interface StatusBadgeProps {
  type: "project" | "rfi" | "task" | "priority";
  value: string;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;

  if (type === "project") config = projectStatusConfig[value as ProjectStatus];
  else if (type === "rfi") config = rfiStatusConfig[value as RFIStatus];
  else if (type === "task") config = taskStatusConfig[value as TaskStatus];
  else if (type === "priority") config = priorityConfig[value as Priority];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
