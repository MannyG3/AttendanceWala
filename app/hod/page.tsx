import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { calculateAttendancePercentage } from "@/lib/attendance-calculator";
import { HodDashboardClient } from "./_components/HodDashboardClient";

export default async function HodDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [pendingLeaves, divisions, students, settings, pendingSessions] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        student: {
          include: { division: true, batch: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({
      include: { division: true, batch: true },
      orderBy: { rollNo: "asc" },
    }),
    prisma.systemSettings.findUnique({ where: { id: "default" } }),
    prisma.session.findMany({
      where: { status: "SCHEDULED" },
      include: {
        timetableSlot: {
          include: { division: true, subject: true, faculty: true },
        },
      },
      orderBy: { date: "asc" },
      take: 20,
    }),
  ]);

  const lateWeight = settings?.lateWeight ?? 1.0;
  const odWeight = settings?.odWeight ?? 1.0;

  // Calculate defaulters
  const allRecords = await prisma.attendanceRecord.findMany({
    where: { session: { status: { not: "CANCELLED" } } },
  });

  const defaulters = students
    .map((student) => {
      const studentRecs = allRecords.filter((r) => r.studentId === student.id);
      const totalHeld = studentRecs.length;
      const pct = calculateAttendancePercentage(studentRecs, totalHeld, { lateWeight, odWeight });

      return {
        id: student.id,
        rollNo: student.rollNo,
        name: student.name,
        divisionName: student.division.name,
        batchName: student.batch.name,
        totalHeld,
        percentage: pct,
      };
    })
    .filter((s) => s.percentage < 75);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">HOD Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review leave applications, track pending attendance marking, unlock locked sessions, and monitor defaulters.
        </p>
      </div>

      <HodDashboardClient
        pendingLeaves={pendingLeaves}
        defaulters={defaulters}
        pendingSessions={pendingSessions}
      />
    </div>
  );
}
