import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { History, ShieldCheck, User } from "lucide-react";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user || !["HOD", "ADMIN"].includes(user.role)) {
    redirect("/unauthorized");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      changedBy: { select: { name: true, role: true, email: true } },
      session: {
        include: {
          timetableSlot: {
            include: { subject: true, division: true },
          },
        },
      },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-purple-400" />
          <span>Attendance Audit Trail</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete history log of all attendance modifications, status overrides, and faculty edits.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Changed By</th>
                <th className="px-6 py-3.5">Subject / Session</th>
                <th className="px-6 py-3.5">Status Transition</th>
                <th className="px-6 py-3.5">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No attendance modifications logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString();
                  const sessionDate = new Date(log.session.date).toISOString().split("T")[0];
                  const slot = log.session.timetableSlot;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5 font-mono text-slate-400">{dateStr}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-white">{log.changedBy.name}</span>
                        <span className="block text-[10px] text-purple-400 font-semibold uppercase">
                          {log.changedBy.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-white">{slot.subject.name}</span>
                        <span className="block text-[10px] text-slate-400">
                          {sessionDate} • Period {slot.periodNo} ({slot.division.name})
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold">
                          {log.oldStatus}
                        </span>
                        <span className="mx-1 text-slate-500">→</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded font-bold">
                          {log.newStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">{log.reason || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
