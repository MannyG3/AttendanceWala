"use client";

import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

interface AttendanceToggleProps {
  status: "present" | "absent";
  onChange: (status: "present" | "absent") => void;
}

export default function AttendanceToggle({
  status,
  onChange,
}: AttendanceToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 p-0.5">
      <button
        type="button"
        onClick={() => onChange("present")}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          status === "present"
            ? "bg-green-600 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        P
      </button>
      <button
        type="button"
        onClick={() => onChange("absent")}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          status === "absent"
            ? "bg-red-600 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        A
      </button>
    </div>
  );
}

export function AttendanceBadge({ pct }: { pct: number }) {
  const isDefaulter = pct < ATTENDANCE_THRESHOLD;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        isDefaulter
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {pct.toFixed(1)}%
    </span>
  );
}
