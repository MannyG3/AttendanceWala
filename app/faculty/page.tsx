import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { generateSessionsForDateRange } from "@/lib/session-generator";
import { FacultySessionsClient } from "./_components/FacultySessionsClient";

export default async function FacultyPage() {
  const user = await getCurrentUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Auto generate upcoming sessions if empty for today
  await generateSessionsForDateRange(today, tomorrow);

  // Query sessions for today
  const sessions = await prisma.session.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
      ...(user?.role === "FACULTY" && user?.facultyId
        ? {
            OR: [
              { timetableSlot: { facultyId: user.facultyId } },
              { substituteFacultyId: user.facultyId },
            ],
          }
        : {}),
    },
    include: {
      timetableSlot: {
        include: {
          division: true,
          subject: true,
          faculty: true,
          batch: true,
        },
      },
      substituteFaculty: true,
      markedBy: { select: { name: true } },
      _count: { select: { attendanceRecords: true } },
    },
    orderBy: { timetableSlot: { periodNo: "asc" } },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Today&apos;s Class Schedule</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tap on any session card to mark attendance or manage session status.
        </p>
      </div>

      <FacultySessionsClient initialSessions={sessions} todayDateStr={today.toISOString().split("T")[0]} />
    </div>
  );
}
