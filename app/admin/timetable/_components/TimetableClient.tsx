"use client";

import { useState } from "react";
import { createTimetableSlot, deleteTimetableSlot } from "../actions";
import { CalendarDays, Plus, Trash2, Clock, MapPin, User, BookOpen } from "lucide-react";

interface SlotItem {
  id: string;
  divisionId: string;
  weekday: number;
  periodNo: number;
  startTime: string;
  endTime: string;
  room: string;
  division: { name: string };
  subject: { id: string; name: string; code: string; type: string };
  faculty: { id: string; name: string };
  batch: { id: string; name: string } | null;
}

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
  type: string;
  divisionId: string;
}

interface FacultyItem {
  id: string;
  name: string;
}

const weekdays = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
];

export function TimetableClient({
  divisions,
  subjects,
  faculty,
  initialSlots,
}: {
  divisions: DivisionItem[];
  subjects: SubjectItem[];
  faculty: FacultyItem[];
  initialSlots: SlotItem[];
}) {
  const [selectedDivisionId, setSelectedDivisionId] = useState(divisions[0]?.id || "");
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [periodNo, setPeriodNo] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [facultyId, setFacultyId] = useState(faculty[0]?.id || "");
  const [batchId, setBatchId] = useState("");
  const [room, setRoom] = useState("LH-101");
  const [loading, setLoading] = useState(false);

  const selectedDivisionObj = divisions.find((d) => d.id === selectedDivisionId);
  const availableBatches = selectedDivisionObj?.batches || [];
  const divisionSubjects = subjects.filter((s) => s.divisionId === selectedDivisionId);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDivisionId || !subjectId || !facultyId) return;
    setLoading(true);
    try {
      await createTimetableSlot(
        selectedDivisionId,
        selectedWeekday,
        Number(periodNo),
        startTime,
        endTime,
        subjectId,
        facultyId,
        batchId || null,
        room
      );
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = initialSlots.filter(
    (slot) => slot.divisionId === selectedDivisionId && slot.weekday === selectedWeekday
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Division Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Division</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Weekday Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 border border-slate-800 rounded-xl overflow-x-auto">
            {weekdays.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWeekday(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedWeekday === w.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slot for {weekdays.find((w) => w.id === selectedWeekday)?.label}</span>
        </button>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No timetable slots created for this day yet.
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg">
                    Period {slot.periodNo}
                  </span>
                  {slot.batch ? (
                    <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg">
                      Batch {slot.batch.name} (Lab)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                      Theory
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm("Delete this slot?")) deleteTimetableSlot(slot.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{slot.subject.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {slot.subject.code}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {slot.room}
                </span>
                <span className="flex items-center gap-1.5 col-span-2 text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  {slot.faculty.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Timetable Slot</h3>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Period No</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={periodNo}
                    onChange={(e) => setPeriodNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="LH-101 or Lab-1"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {divisionSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Faculty Member</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Practical Batch (Optional - leave empty for Theory)
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Entire Division Theory)</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Batch {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Save Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
