"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";
import { SubjectType } from "@prisma/client";

export async function createSubject(code: string, name: string, type: SubjectType, divisionId: string) {
  await requireRole(["ADMIN"]);

  if (!code.trim() || !name.trim() || !divisionId) {
    throw new Error("All fields are required");
  }

  const existing = await prisma.subject.findUnique({ where: { code: code.trim() } });
  if (existing) {
    throw new Error(`Subject with code ${code} already exists`);
  }

  await prisma.subject.create({
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      divisionId,
    },
  });

  revalidatePath("/admin/subjects");
}

export async function deleteSubject(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin/subjects");
}
