// Type aliases for the app — these mirror the Prisma schema.
// Once `prisma generate` runs, import from "@/generated/prisma" directly.

export type Role = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type RFIStatus = "OPEN" | "IN_REVIEW" | "ANSWERED" | "CLOSED";
export type RFIPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type DocumentType = "PLAN" | "PERMIT" | "CONTRACT" | "INSPECTION" | "PHOTO" | "OTHER";
export type FinancialCategory = "LABOR" | "MATERIALS" | "EQUIPMENT" | "SUBCONTRACTOR" | "OVERHEAD" | "OTHER";

export interface DashboardStats {
  activeProjects: number;
  totalBudget: number;
  openRFIs: number;
  overdueTasks: number;
}
