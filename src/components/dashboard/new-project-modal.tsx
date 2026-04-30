"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Manager {
  id: string;
  fullName: string;
}

const STATUS_OPTIONS = [
  { value: "PLANNING",  label: "Planning" },
  { value: "ACTIVE",    label: "Active" },
  { value: "ON_HOLD",   label: "On Hold" },
];

export function NewProjectModal({ managers }: { managers: Manager[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    projectNumber: "",
    clientName: "",
    description: "",
    status: "PLANNING",
    address: "",
    city: "",
    state: "",
    startDate: "",
    targetEndDate: "",
    budgetTotal: "",
    managerId: managers[0]?.id ?? "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setOpen(false);
        setForm({
          name: "",
          projectNumber: "",
          clientName: "",
          description: "",
          status: "PLANNING",
          address: "",
          city: "",
          state: "",
          startDate: "",
          targetEndDate: "",
          budgetTotal: "",
          managerId: managers[0]?.id ?? "",
        });
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name + Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Scottsdale Medical Center"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectNumber">Job #</Label>
              <Input
                id="projectNumber"
                placeholder="CC-2025-005"
                value={form.projectNumber}
                onChange={(e) => update("projectNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="e.g. Banner Health Systems"
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Brief project description..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Status + Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="managerId">Project Manager *</Label>
              <select
                id="managerId"
                required
                value={form.managerId}
                onChange={(e) => update("managerId", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Phoenix"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="AZ"
                maxLength={2}
                value={form.state}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetEndDate">Target End Date</Label>
              <Input
                id="targetEndDate"
                type="date"
                value={form.targetEndDate}
                onChange={(e) => update("targetEndDate", e.target.value)}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="budgetTotal">Total Budget ($)</Label>
            <Input
              id="budgetTotal"
              type="number"
              min="0"
              step="1000"
              placeholder="e.g. 5000000"
              value={form.budgetTotal}
              onChange={(e) => update("budgetTotal", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
