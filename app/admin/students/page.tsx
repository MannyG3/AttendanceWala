import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./_components/StudentsClient";

export default async function StudentsPage() {
  const [students, divisions] = await Promise.all([
    prisma.student.findMany({
      include: {
        division: true,
        batch: true,
      },
      orderBy: { rollNo: "asc" },
    }),
    prisma.division.findMany({
      include: {
        batches: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Student Roster</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage enrolled students, assign batches, and bulk import students via Excel files.
        </p>
      </div>

      <StudentsClient initialStudents={students} divisions={divisions} />
    </div>
  );
}
