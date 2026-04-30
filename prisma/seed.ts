import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
  return data.user!.id;
}

async function main() {
  console.log("🌱 Seeding ProConstruct demo data...");

  const [execId, pmId, fieldId, adminId] = await Promise.all([
    createAuthUser("exec@cornerstone.demo", "Password123!"),
    createAuthUser("pm@cornerstone.demo", "Password123!"),
    createAuthUser("field@cornerstone.demo", "Password123!"),
    createAuthUser("admin@cornerstone.demo", "Password123!"),
  ]);

  const exec = await prisma.user.create({
    data: { supabaseId: execId, email: "exec@cornerstone.demo", fullName: "Marcus Webb", role: "EXECUTIVE", title: "CEO", phone: "(602) 555-0101" },
  });
  const pm = await prisma.user.create({
    data: { supabaseId: pmId, email: "pm@cornerstone.demo", fullName: "Sarah Chen", role: "PROJECT_MANAGER", title: "Senior Project Manager", phone: "(602) 555-0102" },
  });
  const field = await prisma.user.create({
    data: { supabaseId: fieldId, email: "field@cornerstone.demo", fullName: "Diego Ramirez", role: "FIELD_SUPERVISOR", title: "Site Superintendent", phone: "(602) 555-0103" },
  });
  const admin = await prisma.user.create({
    data: { supabaseId: adminId, email: "admin@cornerstone.demo", fullName: "Lisa Patel", role: "ADMIN", title: "Project Controller", phone: "(602) 555-0104" },
  });

  // ─── Projects ──────────────────────────────────────────────────────────────
  const riverside = await prisma.project.create({
    data: {
      projectNumber: "CC-2024-001",
      name: "Riverside Office Complex",
      description: "4-story Class A office building with structured parking. LEED Silver target. 85,000 sq ft total.",
      status: "ACTIVE",
      address: "4200 N Riverside Dr", city: "Tempe", state: "AZ",
      clientName: "Desert Sun Properties LLC",
      startDate: new Date("2024-03-01"), targetEndDate: new Date("2025-06-30"),
      budgetTotal: 12_800_000, budgetSpent: 9_012_000, completionPct: 71,
      managerId: pm.id,
    },
  });

  const highway50 = await prisma.project.create({
    data: {
      projectNumber: "CC-2024-002",
      name: "Highway 50 Interchange Phase 2",
      description: "ADOT infrastructure contract. Phase 2 covers the northern on/off ramp reconstruction and bridge deck overlay.",
      status: "PLANNING",
      address: "US-50 & McQueen Rd", city: "Chandler", state: "AZ",
      clientName: "Arizona Dept. of Transportation",
      startDate: new Date("2025-02-01"), targetEndDate: new Date("2026-08-31"),
      budgetTotal: 8_450_000, budgetSpent: 215_000, completionPct: 3,
      managerId: pm.id,
    },
  });

  const lakewood = await prisma.project.create({
    data: {
      projectNumber: "CC-2023-008",
      name: "Lakewood Residential Development",
      description: "24-unit townhome community. All units delivered on schedule. Final punch list cleared October 2024.",
      status: "COMPLETED",
      address: "8800 W Lakewood Blvd", city: "Goodyear", state: "AZ",
      clientName: "Lakewood Homes Group",
      startDate: new Date("2023-05-15"), targetEndDate: new Date("2024-10-31"), actualEndDate: new Date("2024-10-22"),
      budgetTotal: 4_200_000, budgetSpent: 4_088_000, completionPct: 100,
      managerId: pm.id,
    },
  });

  await prisma.project.create({
    data: {
      projectNumber: "CC-2024-003",
      name: "Mesa Medical Center Expansion",
      description: "Hospital wing addition — 32,000 sq ft. On hold pending permit re-submission.",
      status: "ON_HOLD",
      address: "1900 E Main St", city: "Mesa", state: "AZ",
      clientName: "Banner Health Systems",
      startDate: new Date("2024-09-01"), targetEndDate: new Date("2025-12-31"),
      budgetTotal: 6_100_000, budgetSpent: 340_000, completionPct: 6,
      managerId: pm.id,
    },
  });

  // ─── Members ───────────────────────────────────────────────────────────────
  await prisma.projectMember.createMany({
    data: [
      { projectId: riverside.id, userId: field.id, role: "FIELD_SUPERVISOR" },
      { projectId: riverside.id, userId: admin.id, role: "ADMIN" },
      { projectId: riverside.id, userId: exec.id, role: "EXECUTIVE" },
      { projectId: highway50.id, userId: field.id, role: "FIELD_SUPERVISOR" },
      { projectId: highway50.id, userId: admin.id, role: "ADMIN" },
      { projectId: lakewood.id, userId: admin.id, role: "ADMIN" },
    ],
  });

  // ─── Daily Logs ────────────────────────────────────────────────────────────
  await prisma.dailyLog.createMany({
    data: [
      { projectId: riverside.id, submittedById: field.id, logDate: new Date("2026-04-28"), weatherConditions: "Sunny", temperatureF: 91, workPerformed: "Completed drywall installation on floors 2 and 3, east wing. MEP rough-in inspection passed on Level 2. Elevator shaft formwork set for Level 4 pour scheduled Thursday.", crewCount: 34, hoursWorked: 8.5, safetyNotes: "All crew in PPE. Ladder inspection conducted at 7am." },
      { projectId: riverside.id, submittedById: field.id, logDate: new Date("2026-04-25"), weatherConditions: "Partly Cloudy", temperatureF: 87, workPerformed: "Exterior glazing install progressing — 60% complete on south facade. Concrete pour Level 4 slab, 420 CY placed. Mechanical room rough-in 90% complete.", crewCount: 41, hoursWorked: 9, safetyNotes: "Crane pre-shift inspection completed. No incidents." },
      { projectId: riverside.id, submittedById: field.id, logDate: new Date("2026-04-24"), weatherConditions: "Windy", temperatureF: 83, workPerformed: "Suspended crane operations 11am–2pm due to wind gusts exceeding 25mph. Crew reassigned to interior framing. Level 3 HVAC ductwork installation resumed afternoon.", crewCount: 38, hoursWorked: 7, safetyNotes: "Wind hold protocol followed per safety plan.", issues: "Crane downtime caused 3-hour delay on Level 4 steel delivery staging." },
      { projectId: highway50.id, submittedById: field.id, logDate: new Date("2026-04-27"), weatherConditions: "Clear", temperatureF: 88, workPerformed: "Survey crew on site completing final alignment verification. Traffic control staging reviewed with ADOT inspector.", crewCount: 8, hoursWorked: 8, safetyNotes: "Traffic control plan reviewed with crew." },
    ],
  });

  // ─── RFIs ──────────────────────────────────────────────────────────────────
  await prisma.rFI.createMany({
    data: [
      { projectId: riverside.id, rfiNumber: 1, title: "Structural Steel Beam Dimension Conflict at Grid D-7", description: "Per structural drawings S3.2, W18x40 beam at Grid D-7 conflicts with mechanical duct routing shown on M2.1.", status: "ANSWERED", priority: "HIGH", submittedById: field.id, assignedToId: pm.id, dueDate: new Date("2026-03-15"), answeredAt: new Date("2026-03-14"), answer: "Structural engineer confirms beam can be revised to W16x40. Updated sheet S3.2 Rev B attached." },
      { projectId: riverside.id, rfiNumber: 2, title: "Fire Sprinkler Head Clearance in Parking Structure", description: "Parking deck soffit height at P1-Level is 7'-2\". FP drawings show pendent sprinklers requiring 7'-6\" clearance per NFPA 13.", status: "ANSWERED", priority: "URGENT", submittedById: field.id, assignedToId: pm.id, dueDate: new Date("2026-03-20"), answeredAt: new Date("2026-03-18"), answer: "Use concealed pendant sprinklers per Tyco TY-FRB series. These require only 1\" clearance below deflector." },
      { projectId: riverside.id, rfiNumber: 3, title: "Exterior Curtainwall Sealant Specification Conflict", description: "Spec Section 079200 calls for Dow 795 silicone. Curtainwall subcontractor states Dow 795 is incompatible with their framing system finish.", status: "OPEN", priority: "HIGH", submittedById: field.id, assignedToId: pm.id, dueDate: new Date("2026-04-30") },
      { projectId: riverside.id, rfiNumber: 4, title: "Elevator Pit Waterproofing — Missing Detail", description: "Architectural drawings A5.1 do not include a waterproofing detail for the elevator pit. The pit extends 6'-0\" below grade.", status: "IN_REVIEW", priority: "MEDIUM", submittedById: field.id, assignedToId: pm.id, dueDate: new Date("2026-05-05") },
      { projectId: riverside.id, rfiNumber: 5, title: "Electrical Panel Room Door Hardware — Code Conflict", description: "Electrical room door hardware requires card reader access. NEC 110.26 requires rooms openable from inside without a key.", status: "OPEN", priority: "MEDIUM", submittedById: pm.id, assignedToId: pm.id, dueDate: new Date("2026-05-08") },
      { projectId: highway50.id, rfiNumber: 1, title: "Existing Utility Conflict — Water Main at Station 14+20", description: "Unmarked water main discovered at Station 14+20, 4.2ft depth. Conflicts with proposed storm drain invert.", status: "OPEN", priority: "URGENT", submittedById: field.id, assignedToId: pm.id, dueDate: new Date("2026-05-01") },
      { projectId: highway50.id, rfiNumber: 2, title: "Traffic Control Phasing Notes Conflict", description: "Traffic control notes in TMP sheet TC-4 conflict with city permit condition requiring weekend-only lane closures.", status: "CLOSED", priority: "HIGH", submittedById: admin.id, assignedToId: pm.id, dueDate: new Date("2026-04-12"), answeredAt: new Date("2026-04-10"), answer: "Updated phasing accepted by city inspector. Weekend closure windows approved under permit revision TMP-2." },
    ],
  });

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { projectId: riverside.id, title: "Submit final MEP coordination drawings to city", status: "IN_PROGRESS", priority: "HIGH", assignedToId: pm.id, dueDate: new Date("2026-05-02"), sortOrder: 1 },
      { projectId: riverside.id, title: "Schedule Level 4 concrete pour — confirm mix design", status: "TODO", priority: "HIGH", assignedToId: field.id, dueDate: new Date("2026-05-01"), sortOrder: 2 },
      { projectId: riverside.id, title: "Owner punch list review — 14 items from April 22 walkthrough", status: "IN_PROGRESS", priority: "MEDIUM", assignedToId: pm.id, dueDate: new Date("2026-05-10"), sortOrder: 3 },
      { projectId: riverside.id, title: "Resolve curtainwall sealant RFI-003 with architect", status: "TODO", priority: "HIGH", assignedToId: pm.id, dueDate: new Date("2026-04-30"), sortOrder: 4 },
      { projectId: riverside.id, title: "Update schedule — incorporate crane delay from April 24", status: "DONE", priority: "LOW", assignedToId: pm.id, completedAt: new Date("2026-04-25"), sortOrder: 5 },
      { projectId: riverside.id, title: "Confirm roofing warranty documentation from subcontractor", status: "TODO", priority: "LOW", assignedToId: pm.id, dueDate: new Date("2026-05-15"), sortOrder: 6 },
      { projectId: highway50.id, title: "Submit ADOT Traffic Control Plan for approval", status: "IN_PROGRESS", priority: "HIGH", assignedToId: pm.id, dueDate: new Date("2026-05-03"), sortOrder: 1 },
      { projectId: highway50.id, title: "Resolve utility conflict at Station 14+20 (RFI-001)", status: "BLOCKED", priority: "HIGH", assignedToId: field.id, dueDate: new Date("2026-05-01"), sortOrder: 2 },
    ],
  });

  // ─── Documents ─────────────────────────────────────────────────────────────
  await prisma.document.createMany({
    data: [
      { projectId: riverside.id, name: "Architectural Plans - SD Set Rev 4", type: "PLAN", fileUrl: "https://placeholder.proconstruct/docs/riverside-sd-rev4.pdf", fileSize: 48_200_000, mimeType: "application/pdf", version: "4.0", uploadedById: pm.id },
      { projectId: riverside.id, name: "City of Tempe Building Permit", type: "PERMIT", fileUrl: "https://placeholder.proconstruct/docs/riverside-permit.pdf", fileSize: 1_200_000, mimeType: "application/pdf", uploadedById: admin.id },
      { projectId: riverside.id, name: "General Contract — Desert Sun Properties", type: "CONTRACT", fileUrl: "https://placeholder.proconstruct/docs/riverside-contract.pdf", fileSize: 3_800_000, mimeType: "application/pdf", uploadedById: admin.id },
      { projectId: riverside.id, name: "MEP Rough-In Inspection Report — Level 2", type: "INSPECTION", fileUrl: "https://placeholder.proconstruct/docs/mep-inspection.pdf", fileSize: 890_000, mimeType: "application/pdf", uploadedById: field.id },
    ],
  });

  // ─── Financials ────────────────────────────────────────────────────────────
  await prisma.financialEntry.createMany({
    data: [
      { projectId: riverside.id, category: "LABOR", description: "April labor — self-perform crews", amount: 412_000, isExpense: true, entryDate: new Date("2026-04-30"), vendor: "Cornerstone Internal" },
      { projectId: riverside.id, category: "SUBCONTRACTOR", description: "Southwest Glass — curtainwall install, April billing", amount: 680_000, isExpense: true, entryDate: new Date("2026-04-25"), vendor: "Southwest Glass & Glazing", invoiceNumber: "SWG-2026-0144" },
      { projectId: riverside.id, category: "MATERIALS", description: "Concrete batch — Level 4 slab pour, 420 CY", amount: 98_700, isExpense: true, entryDate: new Date("2026-04-25"), vendor: "Arizona Ready Mix", invoiceNumber: "ARM-22918" },
      { projectId: riverside.id, category: "EQUIPMENT", description: "Tower crane monthly rental — April", amount: 32_500, isExpense: true, entryDate: new Date("2026-04-01"), vendor: "Maxim Crane Works" },
      { projectId: riverside.id, category: "OTHER", description: "Progress payment — Application #9 approved by owner", amount: 1_400_000, isExpense: false, entryDate: new Date("2026-04-15"), vendor: "Desert Sun Properties LLC", invoiceNumber: "PAY-APP-009" },
    ],
  });

  console.log("✅ Seeded successfully!\n");
  console.log("Demo logins (password: Password123!):");
  console.log("  exec@cornerstone.demo");
  console.log("  pm@cornerstone.demo");
  console.log("  field@cornerstone.demo");
  console.log("  admin@cornerstone.demo");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
