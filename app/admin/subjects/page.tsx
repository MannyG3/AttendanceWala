import { prisma } from "@/lib/prisma";
import { SubjectsClient } from "./_components/SubjectsClient";

export default async function SubjectsPage() {
  const [subjects, divisions] = await Promise.all([
    prisma.subject.findMany({
      include: {
        division: true,
        _count: { select: { timetableSlots: true } },
      },
      orderBy: { code: "asc" },
    }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subjects Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage subject codes, theory vs practical types, and division mappings.
        </p>
      </div>

      <SubjectsClient initialSubjects={subjects} divisions={divisions} />
    </div>
  );
}
