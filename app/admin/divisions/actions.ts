"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

export async function createDivision(name: string, department: string, academicYear: string) {
  await requireRole(["ADMIN"]);

  if (!name.trim() || !department.trim()) {
    throw new Error("Name and Department are required");
  }

  await prisma.division.create({
    data: {
      name: name.trim().toUpperCase(),
      department: department.trim(),
      academicYear: academicYear.trim() || "2026-2027",
    },
  });

  revalidatePath("/admin/divisions");
}

export async function deleteDivision(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.division.delete({ where: { id } });
  revalidatePath("/admin/divisions");
}

export async function createBatch(divisionId: string, name: string) {
  await requireRole(["ADMIN"]);

  if (!name.trim()) {
    throw new Error("Batch name is required");
  }

  await prisma.batch.create({
    data: {
      name: name.trim().toUpperCase(),
      divisionId,
    },
  });

  revalidatePath("/admin/divisions");
}

export async function deleteBatch(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.batch.delete({ where: { id } });
  revalidatePath("/admin/divisions");
}
