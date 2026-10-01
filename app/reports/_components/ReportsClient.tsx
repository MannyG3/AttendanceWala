"use client";

import { useState } from "react";
import { BarChart3, FileSpreadsheet, FileText, Filter, Download } from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
}

interface DivisionItem {
  id: string;
  name: string;
  batches: BatchItem[];
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

interface FacultyItem {
  id: string;
  name: string;
}

export function ReportsClient({
  divisions,
  subjects,
  faculty,
}: {
  divisions: DivisionItem[];
  subjects: SubjectItem[];
  faculty: FacultyItem[];
}) {
  const [selectedDivisionId, setSelectedDivisionId] = useState(divisions[0]?.id || "");
  const [reportType, setReportType] = useState("MONTHLY");
  const [defaultersOnly, setDefaultersOnly] = useState(false);

  const handleDownload = (format: "excel" | "pdf") => {
    if (!selectedDivisionId) return;
    const url = `/api/export?divisionId=${selectedDivisionId}&reportType=${reportType}&format=${format}&defaultersOnly=${defaultersOnly}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Generate Attendance Reports</h3>
          <p className="text-xs text-slate-400">Select report parameters and format to export</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Target Division
          </label>
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="MONTHLY">Monthly Subject-Wise Breakdown</option>
            <option value="DAILY">Daily Period-Wise Grid</option>
            <option value="HOURLY">Hourly Session Strength</option>
            <option value="CUMULATIVE">Term Cumulative Summary</option>
            <option value="PRESENT_DAY">Present-Day Rule Summary</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={defaultersOnly}
              onChange={(e) => setDefaultersOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span>Highlight Defaulters Only (&lt;75%)</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          onClick={() => handleDownload("excel")}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel (.xlsx)</span>
        </button>

        <button
          onClick={() => handleDownload("pdf")}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF (.pdf)</span>
        </button>
      </div>
    </div>
  );
}
