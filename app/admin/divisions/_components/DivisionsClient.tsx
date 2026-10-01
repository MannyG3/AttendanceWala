"use client";

import { useState } from "react";
import { createDivision, deleteDivision, createBatch, deleteBatch } from "../actions";
import { Building2, Plus, Trash2, Layers, Users, BookOpen } from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
  _count: { students: number };
}

interface DivisionItem {
  id: string;
  name: string;
  department: string;
  academicYear: string;
  batches: BatchItem[];
  _count: { students: number; subjects: number };
}

export function DivisionsClient({ initialDivisions }: { initialDivisions: DivisionItem[] }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [loading, setLoading] = useState(false);
  const [selectedDivId, setSelectedDivId] = useState<string | null>(null);
  const [batchName, setBatchName] = useState("");

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) return;
    setLoading(true);
    try {
      await createDivision(name, department, academicYear);
      setName("");
      setDepartment("");
    } catch (err: any) {
      alert(err.message || "Failed to create division");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (divisionId: string) => {
    if (!batchName) return;
    try {
      await createBatch(divisionId, batchName);
      setBatchName("");
      setSelectedDivId(null);
    } catch (err: any) {
      alert(err.message || "Failed to create batch");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Division Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          <span>Add New Division</span>
        </h3>
        <form onSubmit={handleCreateDivision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Division Name (e.g. TYAIML-A)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TYAIML-A"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Department Name
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Artificial Intelligence & Machine Learning"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Division"}
          </button>
        </form>
      </div>

      {/* Division List */}
      <div className="lg:col-span-2 space-y-4">
        {initialDivisions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No divisions found. Create one using the form.
          </div>
        ) : (
          initialDivisions.map((div) => (
            <div
              key={div.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{div.name}</span>
                    <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                      {div.academicYear}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{div.department}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete division ${div.name}? This will delete associated students!`)) {
                      deleteDivision(div.id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {div._count.students} Students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  {div._count.subjects} Subjects
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  {div.batches.length} Practical Batches
                </span>
              </div>

              {/* Batches section */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Practical Batches</span>
                  <button
                    onClick={() => setSelectedDivId(selectedDivId === div.id ? null : div.id)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Batch
                  </button>
                </div>

                {selectedDivId === div.id && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Batch Name (e.g. A3)"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCreateBatch(div.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {div.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-200"
                    >
                      <span className="font-semibold text-white">Batch {batch.name}</span>
                      <span className="text-slate-400">({batch._count.students} std)</span>
                      <button
                        onClick={() => deleteBatch(batch.id)}
                        className="text-slate-500 hover:text-red-400 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
