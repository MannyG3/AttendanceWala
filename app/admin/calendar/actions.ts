"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";
import { CalendarEventType } from "@prisma/client";

export async function addCalendarEvent(dateStr: string, type: CalendarEventType, description: string) {
  await requireRole(["ADMIN"]);

  if (!dateStr || !type) {
    throw new Error("Date and event type are required");
  }

  const date = new Date(dateStr);

  await prisma.academicCalendar.upsert({
    where: { date },
    update: {
      type,
      description: description.trim() || null,
    },
    create: {
      date,
      type,
      description: description.trim() || null,
    },
  });

  revalidatePath("/admin/calendar");
}

export async function deleteCalendarEvent(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.academicCalendar.delete({ where: { id } });
  revalidatePath("/admin/calendar");
}
