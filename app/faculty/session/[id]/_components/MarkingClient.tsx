"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveSessionAttendance } from "@/app/faculty/actions";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  Ban,
  UserCheck,
  Save,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react";
import { AttendanceStatus, SessionStatus } from "@prisma/client";

interface StudentItem {
  id: string;
  rollNo: number;
  name: string;
}

interface FacultyItem {
  id: string;
  name: string;
}

interface SessionData {
  id: string;
  date: Date;
  status: SessionStatus;
  markedAt: Date | null;
  isUnlocked: boolean;
  timetableSlot: {
    periodNo: number;
    startTime: string;
    endTime: string;
    room: string;
    division: { name: string };
    subject: { name: string; code: string; type: string };
    faculty: { name: string; id: string };
    batch: { name: string } | null;
  };
  attendanceRecords: { studentId: string; status: AttendanceStatus; remark: string | null }[];
  substituteFaculty: { id: string; name: string } | null;
}

export function MarkingClient({
  session,
  students,
  allFaculty,
  lockHours,
  currentUserRole,
  currentUserId,
}: {
  session: SessionData;
  students: StudentItem[];
  allFaculty: FacultyItem[];
  lockHours: number;
  currentUserRole: string;
  currentUserId: string;
}) {
  const router = useRouter();

  // Map existing records or default all to PRESENT
  const existingMap = new Map(session.attendanceRecords.map((r) => [r.studentId, r.status]));

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      map[s.id] = existingMap.get(s.id) || "PRESENT";
    });
    return map;
  });

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(session.status === "SCHEDULED" ? "HELD" : session.status);
  const [substituteFacultyId, setSubstituteFacultyId] = useState<string>(session.substituteFaculty?.id || "");
  const [saving, setSaving] = useState(false);

  // Check locking condition
  const isMarked = !!session.markedAt;
  const elapsedHours = session.markedAt
    ? (Date.now() - new Date(session.markedAt).getTime()) / (1000 * 60 * 60)
    : 0;
  const isLocked = isMarked && !session.isUnlocked && elapsedHours > lockHours && currentUserRole === "FACULTY";

  // Counts
  const presentCount = Object.values(attendanceMap).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "LATE").length;
  const odCount = Object.values(attendanceMap).filter((s) => s === "OD").length;

  const toggleStudentStatus = (studentId: string) => {
    if (isLocked) return;

    setAttendanceMap((prev) => {
      const current = prev[studentId] || "PRESENT";
      let next: AttendanceStatus = "ABSENT";

      if (current === "PRESENT") next = "ABSENT";
      else if (current === "ABSENT") next = "LATE";
      else if (current === "LATE") next = "OD";
      else if (current === "OD") next = "PRESENT";

      return { ...prev, [studentId]: next };
    });
  };

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (next[s.id] = "PRESENT"));
    setAttendanceMap(next);
  };

  const handleInvertSelection = () => {
    if (isLocked) return;
    setAttendanceMap((prev) => {
      const next: Record<string, AttendanceStatus> = {};
      students.forEach((s) => {
        next[s.id] = prev[s.id] === "PRESENT" ? "ABSENT" : "PRESENT";
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (isLocked) return;
    setSaving(true);
    try {
      const recordsPayload = students.map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id] || "PRESENT",
      }));

      await saveSessionAttendance(session.id, recordsPayload, sessionStatus, substituteFacultyId);
      alert("Attendance saved successfully!");
      router.push("/faculty");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const slot = session.timetableSlot;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Schedule</span>
          </Link>

          {isLocked && (
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Editing Locked (24h limit)
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold rounded-lg">
              Period {slot.periodNo}
            </span>
            {slot.batch && (
              <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-lg">
                Batch {slot.batch.name}
              </span>
            )}
            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg">
              {slot.division.name}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-white">{slot.subject.name}</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Code: {slot.subject.code} • Room: {slot.room} • Time: {slot.startTime} - {slot.endTime}
          </p>
        </div>

        {/* Counter Pill */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <span className="block text-lg font-black text-emerald-400">{presentCount}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Present</span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2">
            <span className="block text-lg font-black text-red-400">{absentCount}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Absent</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
            <span className="block text-lg font-black text-amber-400">{lateCount}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Late</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
            <span className="block text-lg font-black text-blue-400">{odCount}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">OD</span>
          </div>
        </div>

        {/* Session Status & Substitution Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Session Status:</span>
            <select
              disabled={isLocked}
              value={sessionStatus}
              onChange={(e) => setSessionStatus(e.target.value as SessionStatus)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="HELD">Held (Normal)</option>
              <option value="CANCELLED">Cancelled / Not Held</option>
              <option value="SUBSTITUTED">Substituted</option>
            </select>
          </div>

          {sessionStatus === "SUBSTITUTED" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Substitute Faculty:</span>
              <select
                disabled={isLocked}
                value={substituteFacultyId}
                onChange={(e) => setSubstituteFacultyId(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Faculty</option>
                {allFaculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              disabled={isLocked}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              onClick={handleInvertSelection}
              disabled={isLocked}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Invert Selection
            </button>
          </div>
        </div>
      </div>

      {/* Speed Student Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {students.map((student) => {
          const status = attendanceMap[student.id] || "PRESENT";
          const isPresent = status === "PRESENT";
          const isAbsent = status === "ABSENT";
          const isLate = status === "LATE";
          const isOD = status === "OD";

          return (
            <button
              key={student.id}
              onClick={() => toggleStudentStatus(student.id)}
              disabled={isLocked}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden select-none active:scale-95 ${
                isPresent
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-100 hover:border-emerald-500"
                  : isAbsent
                  ? "bg-red-950/40 border-red-500 text-red-100 shadow-md shadow-red-500/10"
                  : isLate
                  ? "bg-amber-950/40 border-amber-500 text-amber-100"
                  : "bg-blue-950/40 border-blue-500 text-blue-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-lg font-black tracking-tight ${
                    isPresent ? "text-emerald-400" : isAbsent ? "text-red-400" : isLate ? "text-amber-400" : "text-blue-400"
                  }`}
                >
                  {student.rollNo}
                </span>

                <span
                  className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded ${
                    isPresent
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isAbsent
                      ? "bg-red-500/30 text-red-400"
                      : isLate
                      ? "bg-amber-500/30 text-amber-400"
                      : "bg-blue-500/30 text-blue-400"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs font-medium truncate">{student.name}</p>
            </button>
          );
        })}
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-16 md:bottom-4 inset-x-0 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between z-20">
        <div className="text-xs font-semibold text-slate-300">
          Summary: <span className="text-emerald-400 font-bold">{presentCount} Present</span>,{" "}
          <span className="text-red-400 font-bold">{absentCount} Absent</span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || isLocked}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Attendance"}</span>
        </button>
      </div>
    </div>
  );
}
