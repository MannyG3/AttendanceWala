"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";
import { RequestStatus } from "@prisma/client";

export async function updateLeaveRequestStatus(requestId: string, status: RequestStatus) {
  const user = await requireRole(["HOD", "ADMIN"]);

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      approvedById: user.id,
    },
  });

  revalidatePath("/hod");
  revalidatePath("/student/leave");
}

export async function unlockSession(sessionId: string) {
  await requireRole(["HOD", "ADMIN"]);

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isUnlocked: true,
    },
  });

  revalidatePath("/hod");
  revalidatePath(`/faculty/session/${sessionId}`);
}
