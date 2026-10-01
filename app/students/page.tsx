"use client";

import { useCallback, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Toast, { useToast } from "@/components/Toast";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoll, setEditRoll] = useState("");
  const [editName, setEditName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast, show, dismiss } = useToast();

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setStudents(data);
    } catch {
      show("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoll || !newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_no: newRoll, name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add");
      }
      setNewRoll("");
      setNewName("");
      show("Student added");
      loadStudents();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add", "error");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setEditRoll(String(student.roll_no));
    setEditName(student.name);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_no: editRoll,
          name: editName.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update");
      }
      setEditingId(null);
      show("Student updated");
      loadStudents();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to update", "error");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      show(isActive ? "Student deactivated" : "Student reactivated");
      loadStudents();
    } catch {
      show("Failed to update status", "error");
    }
  }

  const activeCount = students.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen pb-8">
      <NavBar />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Student Roster</h1>
          <span className="text-xs text-gray-500">
            {activeCount} active / {students.length} total
          </span>
        </div>

        <form onSubmit={handleAdd} className="card mt-4 p-4">
          <h2 className="mb-3 text-sm font-medium">Add Student</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Roll No"
              value={newRoll}
              onChange={(e) => setNewRoll(e.target.value)}
              className="input w-24"
              required
              min={1}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input flex-1"
              required
            />
            <button type="submit" disabled={adding} className="btn-primary shrink-0">
              Add
            </button>
          </div>
        </form>

        {loading ? (
          <div className="mt-8 text-center text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-2">Roll</th>
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-b border-gray-100 ${
                      !student.is_active ? "opacity-50" : ""
                    }`}
                  >
                    {editingId === student.id ? (
                      <>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={editRoll}
                            onChange={(e) => setEditRoll(e.target.value)}
                            className="input w-16 py-1"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input py-1"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <span className="text-xs">
                            {student.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(student.id)}
                              className="btn-primary px-2 py-1 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn-secondary px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 pr-2 font-medium">
                          {student.roll_no}
                        </td>
                        <td className="py-2.5 pr-2">{student.name}</td>
                        <td className="py-2.5 pr-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              student.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(student)}
                              className="text-xs text-brand-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                toggleActive(student.id, student.is_active)
                              }
                              className="text-xs text-gray-500 hover:underline"
                            >
                              {student.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </div>
  );
}
