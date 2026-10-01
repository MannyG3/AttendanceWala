import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { MarkingClient } from "./_components/MarkingClient";

export default async function SessionMarkingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      timetableSlot: {
        include: {
          division: true,
          subject: true,
          faculty: true,
          batch: true,
        },
      },
      attendanceRecords: true,
      substituteFaculty: true,
    },
  });

  if (!session) {
    redirect("/faculty");
  }

  // Fetch students for division (and filter by batch if practical slot!)
  const students = await prisma.student.findMany({
    where: {
      divisionId: session.timetableSlot.divisionId,
      ...(session.timetableSlot.batchId
        ? { batchId: session.timetableSlot.batchId }
        : {}),
    },
    orderBy: { rollNo: "asc" },
  });

  // Fetch all faculty for substitution dropdown
  const allFaculty = await prisma.faculty.findMany({
    orderBy: { name: "asc" },
  });

  const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <MarkingClient
        session={session}
        students={students}
        allFaculty={allFaculty}
        lockHours={settings?.editingLockHours ?? 24}
        currentUserRole={user.role}
        currentUserId={user.id}
      />
    </div>
  );
}
