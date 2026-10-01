import { prisma } from "@/lib/prisma";
import { TimetableClient } from "./_components/TimetableClient";

export default async function TimetablePage() {
  const [divisions, subjects, faculty, slots] = await Promise.all([
    prisma.division.findMany({
      include: { batches: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    prisma.timetableSlot.findMany({
      include: {
        division: true,
        subject: true,
        faculty: true,
        batch: true,
      },
      orderBy: [{ weekday: "asc" }, { periodNo: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Timetable Builder</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure weekly timetable slots per division, map subjects, faculty, rooms, and practical batches.
        </p>
      </div>

      <TimetableClient
        divisions={divisions}
        subjects={subjects}
        faculty={faculty}
        initialSlots={slots}
      />
    </div>
  );
}
