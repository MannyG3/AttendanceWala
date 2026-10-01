"use client";

import { useState } from "react";
import { addCalendarEvent, deleteCalendarEvent } from "../actions";
import { CalendarCheck, Plus, Trash2, PartyPopper, GraduationCap } from "lucide-react";
import { CalendarEventType } from "@prisma/client";

interface CalendarItem {
  id: string;
  date: Date;
  type: CalendarEventType;
  description: string | null;
}

export function CalendarClient({ initialEvents }: { initialEvents: CalendarItem[] }) {
  const [dateStr, setDateStr] = useState("");
  const [type, setType] = useState<CalendarEventType>("HOLIDAY");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !type) return;
    setLoading(true);
    try {
      await addCalendarEvent(dateStr, type, description);
      setDateStr("");
      setDescription("");
    } catch (err: any) {
      alert(err.message || "Failed to add calendar event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          <span>Add Holiday / Exam Week</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Event Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HOLIDAY">Holiday</option>
              <option value="EXAM_WEEK">Exam Week</option>
              <option value="REGULAR">Regular Working Day Override</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Diwali Holiday / Mid-Term Exam"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Event"}
          </button>
        </form>
      </div>

      {/* Events List */}
      <div className="lg:col-span-2 space-y-4">
        {initialEvents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No calendar events or holidays defined yet.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                  {initialEvents.map((event) => {
                    const formattedDate = new Date(event.date).toISOString().split("T")[0];
                    return (
                      <tr key={event.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-3.5 font-bold text-white">{formattedDate}</td>
                        <td className="px-6 py-3.5">
                          {event.type === "HOLIDAY" && (
                            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-semibold">
                              🎉 Holiday
                            </span>
                          )}
                          {event.type === "EXAM_WEEK" && (
                            <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full font-semibold">
                              🎓 Exam Week
                            </span>
                          )}
                          {event.type === "REGULAR" && (
                            <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-semibold">
                              Working Day
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-slate-400">{event.description || "—"}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => {
                              if (confirm("Delete this calendar event?")) deleteCalendarEvent(event.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
