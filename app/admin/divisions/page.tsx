import { prisma } from "@/lib/prisma";
import { DivisionsClient } from "./_components/DivisionsClient";

export default async function DivisionsPage() {
  const divisions = await prisma.division.findMany({
    include: {
      batches: {
        include: {
          _count: {
            select: { students: true },
          },
        },
      },
      _count: {
        select: {
          students: true,
          subjects: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Divisions & Batches</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage academic divisions (e.g. TYAIML-A) and practical lab batches (A1, A2).
        </p>
      </div>

      <DivisionsClient initialDivisions={divisions} />
    </div>
  );
}
