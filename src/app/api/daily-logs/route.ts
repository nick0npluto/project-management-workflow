import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      logDate,
      weatherConditions,
      temperatureF,
      crewCount,
      hoursWorked,
      workPerformed,
      safetyNotes,
      issues,
    } = body;

    if (!projectId || !logDate || !workPerformed) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For now use the PM user as submitter (real auth wired in next phase)
    const submitter = await prisma.user.findFirst({ where: { role: "FIELD_SUPERVISOR" } });
    if (!submitter) {
      return NextResponse.json({ error: "No submitter found" }, { status: 500 });
    }

    const log = await prisma.dailyLog.create({
      data: {
        projectId,
        submittedById: submitter.id,
        logDate: new Date(logDate),
        weatherConditions,
        temperatureF,
        crewCount,
        hoursWorked,
        workPerformed,
        safetyNotes,
        issues,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
