import { prisma } from "@/lib/prisma";
import { FacultyClient } from "./_components/FacultyClient";

export default async function FacultyPage() {
  const faculty = await prisma.faculty.findMany({
    include: {
      user: {
        select: { email: true, role: true },
      },
      _count: {
        select: { timetableSlots: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Directory</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage teaching staff members, employee IDs, department assignments, and login accounts.
        </p>
      </div>

      <FacultyClient initialFaculty={faculty} />
    </div>
  );
}
