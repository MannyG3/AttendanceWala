import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./_components/CalendarClient";

export default async function AcademicCalendarPage() {
  const events = await prisma.academicCalendar.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Academic Calendar & Holidays</h1>
        <p className="text-slate-400 text-sm mt-1">
          Define institutional holidays and exam weeks. Sessions on these dates will be automatically skipped during session generation.
        </p>
      </div>

      <CalendarClient initialEvents={events} />
    </div>
  );
}
