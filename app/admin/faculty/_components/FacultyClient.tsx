"use client";

import { useState } from "react";
import { createFaculty, deleteFaculty } from "../actions";
import { Users, Plus, Trash2, Mail, BadgeCheck, BookOpen } from "lucide-react";

interface FacultyItem {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  user: { email: string; role: string };
  _count: { timetableSlots: number };
}

export function FacultyClient({ initialFaculty }: { initialFaculty: FacultyItem[] }) {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Artificial Intelligence & Machine Learning");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !name || !email) return;
    setLoading(true);
    try {
      await createFaculty(employeeId, name, department, email);
      setEmployeeId("");
      setName("");
      setEmail("");
    } catch (err: any) {
      alert(err.message || "Failed to add faculty");
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
          <span>Add Faculty Member</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Employee ID
            </label>
            <input
              type="text"
              required
              placeholder="FAC004"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Prof. A. B. Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Department
            </label>
            <input
              type="text"
              required
              placeholder="Department Name"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="deshmukh@ritpolytechnic.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Faculty"}
          </button>
        </form>
      </div>

      {/* Directory Grid */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialFaculty.map((f) => (
            <div
              key={f.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-400 tracking-wider">
                      {f.employeeId}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{f.name}</h4>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete faculty member ${f.name}?`)) {
                        deleteFaculty(f.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">{f.department}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {f.user.email}
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-medium shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                  {f._count.timetableSlots} Slots
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
