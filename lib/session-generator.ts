import { prisma } from "./prisma";

/**
 * Generates Session instances for all active TimetableSlots within the date range,
 * automatically skipping any dates marked as HOLIDAY or EXAM_WEEK in the AcademicCalendar.
 */
export async function generateSessionsForDateRange(startDate: Date, endDate: Date): Promise<number> {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 1. Fetch calendar exceptions
  const calendarEvents = await prisma.academicCalendar.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const excludedDatesSet = new Set(
    calendarEvents
      .filter((e) => e.type === "HOLIDAY" || e.type === "EXAM_WEEK")
      .map((e) => new Date(e.date).toISOString().split("T")[0])
  );

  // 2. Fetch all timetable slots
  const slots = await prisma.timetableSlot.findMany();

  let generatedCount = 0;
  const curr = new Date(start);

  while (curr <= end) {
    const isoDateStr = curr.toISOString().split("T")[0];
    const jsWeekday = curr.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const weekday = jsWeekday === 0 ? 7 : jsWeekday;

    // Skip Sunday (7) and excluded calendar dates
    if (weekday !== 7 && !excludedDatesSet.has(isoDateStr)) {
      const daySlots = slots.filter((s) => s.weekday === weekday);
      const sessionDate = new Date(isoDateStr + "T00:00:00.000Z");

      for (const slot of daySlots) {
        await prisma.session.upsert({
          where: {
            timetableSlotId_date: {
              timetableSlotId: slot.id,
              date: sessionDate,
            },
          },
          update: {}, // Keep existing if already generated
          create: {
            timetableSlotId: slot.id,
            date: sessionDate,
            status: "SCHEDULED",
          },
        });
        generatedCount++;
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  return generatedCount;
}
