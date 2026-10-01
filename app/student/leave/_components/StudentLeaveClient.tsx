"use client";

import { useState } from "react";
import { submitLeaveRequest } from "../actions";
import { FileText, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { RequestType, RequestStatus } from "@prisma/client";

interface LeaveItem {
  id: string;
  type: RequestType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: RequestStatus;
  approvedBy: { name: string } | null;
}

export function StudentLeaveClient({ initialRequests }: { initialRequests: LeaveItem[] }) {
  const [type, setType] = useState<RequestType>("LEAVE");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateStr || !endDateStr || !reason) return;
    setLoading(true);
    try {
      await submitLeaveRequest(type, startDateStr, endDateStr, reason);
      setStartDateStr("");
      setEndDateStr("");
      setReason("");
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submit Application Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          <span>New Application</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Application Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RequestType)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="LEAVE">Medical / Personal Leave</option>
              <option value="OD">On-Duty (OD) Official Duty</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Reason / Event Detail
            </label>
            <textarea
              required
              rows={3}
              placeholder="State reason for absence or OD event name..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="lg:col-span-2 space-y-4">
        {initialRequests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No previous leave or OD requests submitted.
          </div>
        ) : (
          initialRequests.map((req) => {
            const start = new Date(req.startDate).toISOString().split("T")[0];
            const end = new Date(req.endDate).toISOString().split("T")[0];

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      req.type === "OD"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {req.type === "OD" ? "On-Duty (OD)" : "Leave"}
                  </span>

                  {req.status === "APPROVED" && (
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {req.status === "REJECTED" && (
                    <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {req.status === "PENDING" && (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending HOD Approval
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-white">{req.reason}</p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Duration: {start} to {end}
                  </span>
                  {req.approvedBy && <span>Reviewed by: {req.approvedBy.name}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
