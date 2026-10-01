"use client";

import { useState } from "react";
import Link from "next/link";
import { updateLeaveRequestStatus, unlockSession } from "../actions";
import { Award, AlertTriangle, CheckCircle2, XCircle, Unlock, Clock, FileText, UserCheck } from "lucide-react";

interface LeaveItem {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  student: { rollNo: number; name: string; division: { name: string }; batch: { name: string } };
}

interface DefaulterItem {
  id: string;
  rollNo: number;
  name: string;
  divisionName: string;
  batchName: string;
  totalHeld: number;
  percentage: number;
}

interface SessionItem {
  id: string;
  date: Date;
  isUnlocked: boolean;
  timetableSlot: {
    periodNo: number;
    division: { name: string };
    subject: { name: string; code: string };
    faculty: { name: string };
  };
}

export function HodDashboardClient({
  pendingLeaves,
  defaulters,
  pendingSessions,
}: {
  pendingLeaves: LeaveItem[];
  defaulters: DefaulterItem[];
  pendingSessions: SessionItem[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    try {
      await updateLeaveRequestStatus(id, status);
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnlock = async (sessionId: string) => {
    try {
      await unlockSession(sessionId);
      alert("Session unlocked! Faculty can now edit attendance.");
    } catch (err: any) {
      alert(err.message || "Failed to unlock session");
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{pendingLeaves.length}</p>
            <p className="text-xs text-slate-400 font-medium">Pending Leave / OD Requests</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{defaulters.length}</p>
            <p className="text-xs text-slate-400 font-medium">Defaulter Students (&lt;75%)</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{pendingSessions.length}</p>
            <p className="text-xs text-slate-400 font-medium">Unmarked Pending Sessions</p>
          </div>
        </div>
      </div>

      {/* Pending Leave Applications Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Pending Leave / OD Applications</span>
        </h3>

        {pendingLeaves.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No pending leave or OD applications.</p>
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map((req) => {
              const start = new Date(req.startDate).toISOString().split("T")[0];
              const end = new Date(req.endDate).toISOString().split("T")[0];

              return (
                <div
                  key={req.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {req.student.name} (Roll {req.student.rollNo})
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                        {req.student.division.name}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-extrabold rounded-full">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">{req.reason}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dates: {start} to {end}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(req.id, "APPROVED")}
                      disabled={loadingId === req.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleApprove(req.id, "REJECTED")}
                      disabled={loadingId === req.id}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Defaulter Students List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Class Defaulters (&lt;75% Attendance)</span>
        </h3>

        {defaulters.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Great news! No student is currently below the 75% attendance threshold.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Division</th>
                  <th className="px-4 py-3">Held Sessions</th>
                  <th className="px-4 py-3 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {defaulters.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-2.5 font-bold text-red-400">{d.rollNo}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{d.name}</td>
                    <td className="px-4 py-2.5">{d.divisionName}</td>
                    <td className="px-4 py-2.5">{d.totalHeld}</td>
                    <td className="px-4 py-2.5 text-right font-black text-red-400">
                      {d.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Unmarked Sessions Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span>Pending Unmarked Sessions</span>
        </h3>

        {pendingSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">All sessions have been marked by faculty.</p>
        ) : (
          <div className="divide-y divide-slate-800/60 text-xs">
            {pendingSessions.map((session) => {
              const dateStr = new Date(session.date).toISOString().split("T")[0];
              const slot = session.timetableSlot;

              return (
                <div key={session.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">{slot.subject.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Teacher: <span className="text-purple-400 font-semibold">{slot.faculty.name}</span> • Date: {dateStr} (Period {slot.periodNo})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/faculty/session/${session.id}`}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                    >
                      View / Mark
                    </Link>
                    {!session.isUnlocked && (
                      <button
                        onClick={() => handleUnlock(session.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Unlock className="w-3 h-3" /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
