import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      projectNumber,
      clientName,
      description,
      status,
      address,
      city,
      state,
      startDate,
      targetEndDate,
      budgetTotal,
      managerId,
    } = body;

    if (!name || !managerId) {
      return NextResponse.json({ error: "Name and manager are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        projectNumber: projectNumber || null,
        clientName: clientName || null,
        description: description || null,
        status: status || "PLANNING",
        address: address || null,
        city: city || null,
        state: state || null,
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        budgetTotal: budgetTotal ? parseFloat(budgetTotal) : null,
        managerId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
