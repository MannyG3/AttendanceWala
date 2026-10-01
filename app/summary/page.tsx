"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { AttendanceBadge } from "@/components/AttendanceToggle";
import Toast, { useToast } from "@/components/Toast";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import type { SummaryRow } from "@/lib/types";
import { currentMonthISO, downloadExcel, formatMonthLabel } from "@/lib/utils";

export default function SummaryPage() {
  const [month, setMonth] = useState(currentMonthISO);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [defaulters, setDefaulters] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDefaultersOnly, setShowDefaultersOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast, show, dismiss } = useToast();

  const loadSummary = useCallback(async (selectedMonth: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summary?month=${selectedMonth}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSummary(data.summary);
      setDefaulters(data.defaulters);
    } catch {
      show("Failed to load summary", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadSummary(month);
  }, [month, loadSummary]);

  const displayRows = useMemo(() => {
    return showDefaultersOnly ? defaulters : summary;
  }, [showDefaultersOnly, defaulters, summary]);

  async function handleExport(type: "full" | "defaulters") {
    setExporting(true);
    try {
      await downloadExcel(month, type);
      show(
        type === "defaulters"
          ? "Defaulter report downloaded"
          : "Full report downloaded"
      );
    } catch (err) {
      show(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <NavBar />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="text-lg font-semibold">Monthly Summary</h1>

        <div className="card mt-4 p-4">
          <label htmlFor="month" className="mb-1 block text-sm font-medium">
            Month
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formatMonthLabel(month)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDefaultersOnly}
              onChange={(e) => setShowDefaultersOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600"
            />
            Show Defaulters Only (&lt; {ATTENDANCE_THRESHOLD}%)
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => handleExport("full")}
            disabled={exporting}
            className="btn-primary"
          >
            Download Excel Report
          </button>
          <button
            onClick={() => handleExport("defaulters")}
            disabled={exporting}
            className="btn-secondary"
          >
            Export Defaulters
          </button>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-sm text-gray-500">Loading…</div>
        ) : displayRows.length === 0 ? (
          <div className="mt-8 text-center text-sm text-gray-500">
            {showDefaultersOnly
              ? "No defaulters this month."
              : "No attendance data for this month."}
          </div>
        ) : (
          <>
            {showDefaultersOnly && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-red-800">
                  Defaulter List — {defaulters.length} student
                  {defaulters.length !== 1 ? "s" : ""}
                </h2>
                <p className="mt-0.5 text-xs text-red-600">
                  Below {ATTENDANCE_THRESHOLD}% attendance threshold
                </p>
              </div>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th className="pb-2 pr-2">Roll</th>
                    <th className="pb-2 pr-2">Name</th>
                    <th className="pb-2 pr-2 text-center">Present</th>
                    <th className="pb-2 pr-2 text-center">Total</th>
                    <th className="pb-2 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => {
                    const isDefaulter =
                      row.total_marked > 0 &&
                      row.attendance_pct < ATTENDANCE_THRESHOLD;
                    return (
                      <tr
                        key={row.student_id}
                        className={`border-b border-gray-100 ${
                          isDefaulter ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-2 font-medium">
                          {row.roll_no}
                        </td>
                        <td className="py-2.5 pr-2">{row.name}</td>
                        <td className="py-2.5 pr-2 text-center">
                          {row.days_present}
                        </td>
                        <td className="py-2.5 pr-2 text-center">
                          {row.total_marked}
                        </td>
                        <td className="py-2.5 text-center">
                          <AttendanceBadge pct={row.attendance_pct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </div>
  );
}
