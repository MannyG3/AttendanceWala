"use client";

import { useState } from "react";
import { GraduationCap, Award, AlertTriangle, CheckCircle2, Calculator, BookOpen, Calendar } from "lucide-react";

interface SubjectStat {
  id: string;
  code: string;
  name: string;
  totalHeld: number;
  percentage: number;
  shortage: number;
}

interface RecordItem {
  id: string;
  status: string;
  session: {
    date: Date;
    timetableSlot: {
      periodNo: number;
      subject: { name: string; code: string };
    };
  };
}

export function StudentDashboardClient({
  student,
  overallPercentage,
  totalHeldOverall,
  overallShortage,
  subjectStats,
  recentRecords,
}: {
  student: { rollNo: number; name: string; division: { name: string }; batch: { name: string } };
  overallPercentage: number;
  totalHeldOverall: number;
  overallShortage: number;
  subjectStats: SubjectStat[];
  recentRecords: RecordItem[];
}) {
  // Color coding helper
  const getBadgeColor = (pct: number) => {
    if (pct >= 75) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (pct >= 70) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const getRingColor = (pct: number) => {
    if (pct >= 75) return "stroke-emerald-500";
    if (pct >= 70) return "stroke-amber-500";
    return "stroke-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Student Profile & Overall Percentage Ring Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
            <GraduationCap className="w-4 h-4" /> Roll No: {student.rollNo}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{student.name}</h1>
          <p className="text-xs text-slate-400 font-medium">
            Division: <span className="text-white font-bold">{student.division.name}</span> • Batch:{" "}
            <span className="text-white font-bold">{student.batch.name}</span>
          </p>
        </div>

        {/* Circular Progress Meter */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getRingColor(overallPercentage)} transition-all duration-1000 ease-out`}
                strokeDasharray={`${overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white">{overallPercentage.toFixed(1)}%</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall</span>
            </div>
          </div>

          {overallShortage > 0 ? (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Attend {overallShortage} more lectures for 75%</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Criteria Met (≥75%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Subject-Wise Attendance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectStats.map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400">[{sub.code}]</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{sub.name}</h4>
                </div>
                <span className={`px-3 py-1 border text-sm font-black rounded-xl ${getBadgeColor(sub.percentage)}`}>
                  {sub.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Held Lectures: {sub.totalHeld}</span>
                  {sub.shortage > 0 ? (
                    <span className="text-red-400 font-bold">Need +{sub.shortage} lectures</span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">On Track</span>
                  )}
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.percentage >= 75
                        ? "bg-emerald-500"
                        : sub.percentage >= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Period History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span>Recent Period Attendance</span>
        </h3>

        <div className="divide-y divide-slate-800/60 text-xs">
          {recentRecords.map((r) => {
            const dateStr = new Date(r.session.date).toISOString().split("T")[0];
            const isPresent = r.status === "PRESENT";
            const isAbsent = r.status === "ABSENT";
            const isLate = r.status === "LATE";

            return (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{r.session.timetableSlot.subject.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Date: {dateStr} • Period {r.session.timetableSlot.periodNo}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    isPresent
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : isAbsent
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : isLate
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
