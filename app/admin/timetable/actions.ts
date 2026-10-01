"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

export async function createTimetableSlot(
  divisionId: string,
  weekday: number,
  periodNo: number,
  startTime: string,
  endTime: string,
  subjectId: string,
  facultyId: string,
  batchId: string | null,
  room: string
) {
  await requireRole(["ADMIN"]);

  if (!divisionId || !weekday || !periodNo || !startTime || !endTime || !subjectId || !facultyId || !room) {
    throw new Error("All fields are required");
  }

  await prisma.timetableSlot.create({
    data: {
      divisionId,
      weekday: Number(weekday),
      periodNo: Number(periodNo),
      startTime,
      endTime,
      subjectId,
      facultyId,
      batchId: batchId || null,
      room,
    },
  });

  revalidatePath("/admin/timetable");
}

export async function deleteTimetableSlot(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.timetableSlot.delete({ where: { id } });
  revalidatePath("/admin/timetable");
}
