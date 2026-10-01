import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { generateExcelReport, generatePdfReport } from "@/lib/export-utils";
import { calculateAttendancePercentage } from "@/lib/attendance-calculator";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  const reportType = searchParams.get("reportType") || "MONTHLY";
  const format = searchParams.get("format") || "excel"; // 'excel' | 'pdf'
  const filterDefaulters = searchParams.get("defaultersOnly") === "true";

  if (!divisionId) {
    return NextResponse.json({ error: "divisionId is required" }, { status: 400 });
  }

  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  const students = await prisma.student.findMany({
    where: { divisionId },
    include: { batch: true },
    orderBy: { rollNo: "asc" },
  });

  const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
  const lateWeight = settings?.lateWeight ?? 1.0;
  const odWeight = settings?.odWeight ?? 1.0;

  const records = await prisma.attendanceRecord.findMany({
    where: {
      student: { divisionId },
      session: { status: { not: "CANCELLED" } },
    },
    include: {
      session: {
        include: {
          timetableSlot: {
            include: { subject: true },
          },
        },
      },
    },
  });

  // Calculate student metrics
  const headers = ["Roll No", "Student Name", "Batch", "Total Held", "Attended (Weighted)", "Attendance %", "Status"];
  const rows: (string | number)[][] = [];

  for (const student of students) {
    const studentRecs = records.filter((r) => r.studentId === student.id);
    const totalHeld = studentRecs.length;
    const pct = calculateAttendancePercentage(studentRecs, totalHeld, { lateWeight, odWeight });

    let weightedCount = 0;
    for (const r of studentRecs) {
      if (r.status === "PRESENT") weightedCount += 1;
      else if (r.status === "LATE") weightedCount += lateWeight;
      else if (r.status === "OD") weightedCount += odWeight;
    }

    const isDefaulter = pct < 75;
    if (filterDefaulters && !isDefaulter) continue;

    rows.push([
      student.rollNo,
      student.name,
      student.batch.name,
      totalHeld,
      weightedCount,
      `${pct.toFixed(1)}%`,
      isDefaulter ? "DEFAULTER (<75%)" : "SATISFACTORY",
    ]);
  }

  const title = `${division?.name || "Division"} - ${reportType} Attendance Report`;

  if (format === "pdf") {
    const pdfBytes = await generatePdfReport(title, headers, rows);
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${division?.name}_Attendance.pdf"`,
      },
    });
  } else {
    const excelBuffer = await generateExcelReport(title, headers, rows);
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${division?.name}_Attendance.xlsx"`,
      },
    });
  }
}
