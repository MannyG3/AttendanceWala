"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

export async function createStudent(rollNo: number, name: string, divisionId: string, batchId: string) {
  await requireRole(["ADMIN"]);

  if (!rollNo || !name.trim() || !divisionId || !batchId) {
    throw new Error("All fields are required");
  }

  const existing = await prisma.student.findUnique({ where: { rollNo } });
  if (existing) {
    throw new Error(`Student with Roll No ${rollNo} already exists`);
  }

  const email = `student${rollNo}@ritpolytechnic.edu.in`;
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name.trim(),
      role: "STUDENT",
    },
  });

  await prisma.student.create({
    data: {
      rollNo,
      name: name.trim(),
      divisionId,
      batchId,
      userId: user.id,
    },
  });

  revalidatePath("/admin/students");
}

export async function deleteStudent(id: string) {
  await requireRole(["ADMIN"]);
  const student = await prisma.student.findUnique({ where: { id } });
  if (student?.userId) {
    await prisma.user.delete({ where: { id: student.userId } });
  } else {
    await prisma.student.delete({ where: { id } });
  }
  revalidatePath("/admin/students");
}

export async function bulkImportStudents(students: { rollNo: number; name: string; batchName: string }[], divisionId: string) {
  await requireRole(["ADMIN"]);

  if (!divisionId || !students || students.length === 0) {
    throw new Error("Invalid import payload");
  }

  const batches = await prisma.batch.findMany({ where: { divisionId } });
  const batchMap = new Map(batches.map((b) => [b.name.toUpperCase(), b.id]));

  const hashedPassword = await bcrypt.hash("password123", 10);
  let importedCount = 0;

  for (const item of students) {
    if (!item.rollNo || !item.name) continue;

    const batchId = batchMap.get(item.batchName?.toUpperCase()) || batches[0]?.id;
    if (!batchId) continue;

    const existing = await prisma.student.findUnique({ where: { rollNo: Number(item.rollNo) } });
    if (existing) continue;

    const email = `student${item.rollNo}@ritpolytechnic.edu.in`;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: item.name.trim(),
        role: "STUDENT",
      },
    });

    await prisma.student.create({
      data: {
        rollNo: Number(item.rollNo),
        name: item.name.trim(),
        divisionId,
        batchId,
        userId: user.id,
      },
    });

    importedCount++;
  }

  revalidatePath("/admin/students");
  return importedCount;
}
