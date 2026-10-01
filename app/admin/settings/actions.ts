"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

export async function updateSettings(
  lateWeight: number,
  odWeight: number,
  presentDayThresholdPercent: number,
  editingLockHours: number
) {
  await requireRole(["ADMIN"]);

  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {
      lateWeight: Number(lateWeight),
      odWeight: Number(odWeight),
      presentDayThresholdPercent: Number(presentDayThresholdPercent),
      editingLockHours: Number(editingLockHours),
    },
    create: {
      id: "default",
      lateWeight: Number(lateWeight),
      odWeight: Number(odWeight),
      presentDayThresholdPercent: Number(presentDayThresholdPercent),
      editingLockHours: Number(editingLockHours),
    },
  });

  revalidatePath("/admin/settings");
}
