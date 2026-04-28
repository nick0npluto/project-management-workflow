import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

type EmptyVariant = "projects" | "tasks" | "logs" | "rfis" | "documents" | "financials" | "generic";

const config: Record<EmptyVariant, { icon: LucideIcon; title: string; description: string }> = {
  projects: {
    icon: FolderOpen,
    title: "No projects yet",
    description: "Projects assigned to you will appear here.",
  },
  tasks: {
    icon: ClipboardList,
    title: "No open tasks",
    description: "All tasks are complete — nice work.",
  },
  logs: {
    icon: FileText,
    title: "No daily logs",
    description: "Submit the first log for today's work.",
  },
  rfis: {
    icon: MessageSquare,
    title: "No RFIs",
    description: "Requests for information will appear here.",
  },
  documents: {
    icon: FileText,
    title: "No documents",
    description: "Upload plans, permits, and contracts to keep everything in one place.",
  },
  financials: {
    icon: DollarSign,
    title: "No financial entries",
    description: "Cost entries and budget data will appear here.",
  },
  generic: {
    icon: FolderOpen,
    title: "Nothing here yet",
    description: "Data will appear here once it's available.",
  },
};

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { icon: Icon, title: defaultTitle, description: defaultDescription } = config[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title ?? defaultTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description ?? defaultDescription}</p>
      {action && (
        <Button size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
