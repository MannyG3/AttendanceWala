import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { StudentLeaveClient } from "./_components/StudentLeaveClient";

export default async function StudentLeavePage() {
  const user = await getCurrentUser();
  if (!user || !user.studentId) redirect("/login");

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { studentId: user.studentId },
    include: {
      approvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Leave & OD Requests</h1>
        <p className="text-slate-400 text-sm mt-1">
          Submit Leave or On-Duty (OD) applications for HOD approval.
        </p>
      </div>

      <StudentLeaveClient initialRequests={leaveRequests} />
    </div>
  );
}
