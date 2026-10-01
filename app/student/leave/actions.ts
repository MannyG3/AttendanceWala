"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";
import { RequestType } from "@prisma/client";

export async function submitLeaveRequest(
  type: RequestType,
  startDateStr: string,
  endDateStr: string,
  reason: string
) {
  const user = await requireAuth();
  if (!user.studentId) {
    throw new Error("Only students can submit leave requests");
  }

  if (!startDateStr || !endDateStr || !reason.trim()) {
    throw new Error("All fields are required");
  }

  await prisma.leaveRequest.create({
    data: {
      studentId: user.studentId,
      type,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      reason: reason.trim(),
      status: "PENDING",
    },
  });

  revalidatePath("/student/leave");
}
