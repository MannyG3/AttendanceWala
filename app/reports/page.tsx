import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { ReportsClient } from "./_components/ReportsClient";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [divisions, subjects, faculty] = await Promise.all([
    prisma.division.findMany({ include: { batches: true }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.faculty.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Reports & Exports</h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate period-wise, daily, weekly, monthly defaulter, and present-day reports with PDF & Excel downloads.
        </p>
      </div>

      <ReportsClient divisions={divisions} subjects={subjects} faculty={faculty} />
    </div>
  );
}
