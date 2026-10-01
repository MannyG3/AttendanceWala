"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

export async function createFaculty(employeeId: string, name: string, department: string, email: string) {
  await requireRole(["ADMIN"]);

  if (!employeeId.trim() || !name.trim() || !department.trim() || !email.trim()) {
    throw new Error("All fields are required");
  }

  const existingFaculty = await prisma.faculty.findUnique({ where: { employeeId: employeeId.trim() } });
  if (existingFaculty) {
    throw new Error(`Faculty with Employee ID ${employeeId} already exists`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existingUser) {
    throw new Error(`User with email ${email} already exists`);
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: "FACULTY",
    },
  });

  await prisma.faculty.create({
    data: {
      employeeId: employeeId.trim().toUpperCase(),
      name: name.trim(),
      department: department.trim(),
      userId: user.id,
    },
  });

  revalidatePath("/admin/faculty");
}

export async function deleteFaculty(id: string) {
  await requireRole(["ADMIN"]);
  const faculty = await prisma.faculty.findUnique({ where: { id } });
  if (faculty?.userId) {
    await prisma.user.delete({ where: { id: faculty.userId } });
  } else {
    await prisma.faculty.delete({ where: { id } });
  }
  revalidatePath("/admin/faculty");
}
