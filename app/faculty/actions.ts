"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { generateSessionsForDateRange } from "@/lib/session-generator";
import { AttendanceStatus, SessionStatus } from "@prisma/client";

export async function generateTodaySessionsAction() {
  const user = await requireAuth();
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  return await generateSessionsForDateRange(today, nextWeek);
}

export async function saveSessionAttendance(
  sessionId: string,
  records: { studentId: string; status: AttendanceStatus; remark?: string }[],
  sessionStatus: SessionStatus = "HELD",
  substituteFacultyId?: string
) {
  const user = await requireAuth();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      timetableSlot: true,
      attendanceRecords: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Lock Check: If session was marked > 24h ago and is not unlocked by HOD/Admin
  const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
  const lockHours = settings?.editingLockHours ?? 24;

  if (session.markedAt && !session.isUnlocked && user.role === "FACULTY") {
    const elapsedHours = (Date.now() - new Date(session.markedAt).getTime()) / (1000 * 60 * 60);
    if (elapsedHours > lockHours) {
      throw new Error(`Editing locked. Session was marked over ${lockHours} hours ago. Request HOD/Admin unlock.`);
    }
  }

  const oldRecordMap = new Map(session.attendanceRecords.map((r) => [r.studentId, r.status]));

  // Upsert Attendance Records
  for (const item of records) {
    const oldStatus = oldRecordMap.get(item.studentId);

    // Upsert record
    const updatedRecord = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: item.studentId,
        },
      },
      update: {
        status: item.status,
        remark: item.remark || null,
      },
      create: {
        sessionId,
        studentId: item.studentId,
        status: item.status,
        remark: item.remark || null,
      },
    });

    // Write Audit Log if status changed
    if (oldStatus && oldStatus !== item.status) {
      await prisma.auditLog.create({
        data: {
          sessionId,
          attendanceRecordId: updatedRecord.id,
          changedById: user.id,
          oldStatus,
          newStatus: item.status,
          reason: item.remark || "Attendance edit by faculty",
        },
      });
    }
  }

  // Update Session status
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: sessionStatus,
      markedById: user.id,
      markedAt: new Date(),
      substituteFacultyId: substituteFacultyId || null,
    },
  });

  revalidatePath(`/faculty/session/${sessionId}`);
  revalidatePath("/faculty");
}
