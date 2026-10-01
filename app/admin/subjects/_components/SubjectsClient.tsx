"use client";

import { useState } from "react";
import { createSubject, deleteSubject } from "../actions";
import { BookOpen, Plus, Trash2, FlaskConical, BookText } from "lucide-react";
import { SubjectType } from "@prisma/client";

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  type: SubjectType;
  divisionId: string;
  division: { name: string };
  _count: { timetableSlots: number };
}

interface DivisionItem {
  id: string;
  name: string;
}

export function SubjectsClient({
  initialSubjects,
  divisions,
}: {
  initialSubjects: SubjectItem[];
  divisions: DivisionItem[];
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<SubjectType>("THEORY");
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !divisionId) return;
    setLoading(true);
    try {
      await createSubject(code, name, type, divisionId);
      setCode("");
      setName("");
    } catch (err: any) {
      alert(err.message || "Failed to create subject");
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
          <span>Add Subject</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Subject Code
            </label>
            <input
              type="text"
              required
              placeholder="22616"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Subject Name
            </label>
            <input
              type="text"
              required
              placeholder="Programming with Python"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SubjectType)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Division
              </label>
              <select
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Subject"}
          </button>
        </form>
      </div>

      {/* Subject List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialSubjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        sub.type === "PRACTICAL"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {sub.type === "PRACTICAL" ? "Practical" : "Theory"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete subject ${sub.name}?`)) {
                        deleteSubject(sub.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-base font-bold text-white mt-3">{sub.name}</h4>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Division: {sub.division.name}</span>
                <span>{sub._count.timetableSlots} Timetable Slots</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
