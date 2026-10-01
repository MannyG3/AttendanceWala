"use client";

import Link from "next/link";
import { Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, Layers, UserCheck } from "lucide-react";

interface SessionItem {
  id: string;
  status: string;
  markedAt: Date | null;
  timetableSlot: {
    periodNo: number;
    startTime: string;
    endTime: string;
    room: string;
    division: { name: string };
    subject: { name: string; code: string; type: string };
    faculty: { name: string };
    batch: { name: string } | null;
  };
  substituteFaculty: { name: string } | null;
  markedBy: { name: string } | null;
}

export function FacultySessionsClient({
  initialSessions,
  todayDateStr,
}: {
  initialSessions: SessionItem[];
  todayDateStr: string;
}) {
  return (
    <div className="space-y-4">
      {/* Date Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date: {todayDateStr}</span>
        <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold rounded-full">
          {initialSessions.length} Sessions Scheduled
        </span>
      </div>

      {/* Sessions List */}
      {initialSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
          No classes scheduled for today! Enjoy your day.
        </div>
      ) : (
        initialSessions.map((session) => {
          const isHeld = session.status === "HELD";
          const isCancelled = session.status === "CANCELLED";
          const slot = session.timetableSlot;

          return (
            <Link
              key={session.id}
              href={`/faculty/session/${session.id}`}
              className="block bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition shadow-lg relative group overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-lg">
                    Period {slot.periodNo}
                  </span>

                  {slot.batch ? (
                    <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-lg flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Batch {slot.batch.name}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg">
                      Theory
                    </span>
                  )}
                </div>

                {isHeld && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marked
                  </span>
                )}
                {isCancelled && (
                  <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full">
                    Cancelled
                  </span>
                )}
                {!isHeld && !isCancelled && (
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full animate-pulse">
                    Pending
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-blue-400 transition">
                    {slot.subject.name}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  [{slot.subject.code}] • Division {slot.division.name}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {slot.room}
                </span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
