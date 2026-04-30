"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

const statusOptions: Array<{ value: ProjectStatus; label: string }> = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ProjectStatusControl({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<ProjectStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (nextStatus === currentStatus) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update project status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to update project status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value as ProjectStatus)}
        className="h-8 min-w-[130px] rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="secondary"
        disabled={saving || nextStatus === currentStatus}
        onClick={handleSave}
        className="h-8 px-2.5"
      >
        <Check className="h-3.5 w-3.5" />
        <span className="ml-1">{saving ? "Saving..." : "Save"}</span>
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
