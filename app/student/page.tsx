import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import {
  calculateAttendancePercentage,
  calculateShortageLectures,
} from "@/lib/attendance-calculator";
import { StudentDashboardClient } from "./_components/StudentDashboardClient";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.studentId) redirect("/login");

  const [student, settings, records] = await Promise.all([
    prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        division: true,
        batch: true,
      },
    }),
    prisma.systemSettings.findUnique({ where: { id: "default" } }),
    prisma.attendanceRecord.findMany({
      where: { studentId: user.studentId },
      include: {
        session: {
          include: {
            timetableSlot: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { session: { date: "desc" } },
    }),
  ]);

  if (!student) redirect("/login");

  const lateWeight = settings?.lateWeight ?? 1.0;
  const odWeight = settings?.odWeight ?? 1.0;

  // Filter out CANCELLED sessions
  const validRecords = records.filter((r) => r.session.status !== "CANCELLED");

  // Overall calculations
  const totalHeldOverall = validRecords.length;
  const overallPercentage = calculateAttendancePercentage(validRecords, totalHeldOverall, {
    lateWeight,
    odWeight,
  });

  // Calculate attended weighted total
  let attendedWeightedOverall = 0;
  for (const r of validRecords) {
    if (r.status === "PRESENT") attendedWeightedOverall += 1;
    else if (r.status === "LATE") attendedWeightedOverall += lateWeight;
    else if (r.status === "OD") attendedWeightedOverall += odWeight;
  }

  const overallShortage = calculateShortageLectures(attendedWeightedOverall, totalHeldOverall, 75);

  // Subject-wise Breakdown
  const subjectMap = new Map<string, { code: string; name: string; records: typeof validRecords }>();

  for (const r of validRecords) {
    const sub = r.session.timetableSlot.subject;
    if (!subjectMap.has(sub.id)) {
      subjectMap.set(sub.id, { code: sub.code, name: sub.name, records: [] });
    }
    subjectMap.get(sub.id)!.records.push(r);
  }

  const subjectStats = Array.from(subjectMap.entries()).map(([id, item]) => {
    const totalHeld = item.records.length;
    const percentage = calculateAttendancePercentage(item.records, totalHeld, { lateWeight, odWeight });

    let attendedWeighted = 0;
    for (const r of item.records) {
      if (r.status === "PRESENT") attendedWeighted += 1;
      else if (r.status === "LATE") attendedWeighted += lateWeight;
      else if (r.status === "OD") attendedWeighted += odWeight;
    }

    const shortage = calculateShortageLectures(attendedWeighted, totalHeld, 75);

    return {
      id,
      code: item.code,
      name: item.name,
      totalHeld,
      percentage,
      shortage,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <StudentDashboardClient
        student={student}
        overallPercentage={overallPercentage}
        totalHeldOverall={totalHeldOverall}
        overallShortage={overallShortage}
        subjectStats={subjectStats}
        recentRecords={records.slice(0, 10)}
      />
    </div>
  );
}
