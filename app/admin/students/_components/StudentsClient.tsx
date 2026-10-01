"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import { createStudent, deleteStudent, bulkImportStudents } from "../actions";
import { GraduationCap, Plus, Upload, Trash2, Search, Filter, FileSpreadsheet } from "lucide-react";

interface StudentItem {
  id: string;
  rollNo: number;
  name: string;
  divisionId: string;
  batchId: string;
  division: { id: string; name: string };
  batch: { id: string; name: string };
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

export function StudentsClient({
  initialStudents,
  divisions,
}: {
  initialStudents: StudentItem[];
  divisions: DivisionItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Single Add state
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || "");
  const [batchId, setBatchId] = useState(divisions[0]?.batches[0]?.id || "");
  const [loading, setLoading] = useState(false);

  // Excel Bulk Import state
  const [importDivisionId, setImportDivisionId] = useState(divisions[0]?.id || "");
  const [importLoading, setImportLoading] = useState(false);

  const selectedDivisionObj = divisions.find((d) => d.id === divisionId);
  const availableBatches = selectedDivisionObj?.batches || [];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo || !name || !divisionId || !batchId) return;
    setLoading(true);
    try {
      await createStudent(Number(rollNo), name, divisionId, batchId);
      setRollNo("");
      setName("");
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importDivisionId) return;

    setImportLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const parsedStudents: { rollNo: number; name: string; batchName: string }[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const roll = Number(row.getCell(1).value);
        const studentName = String(row.getCell(2).value || "").trim();
        const batchName = String(row.getCell(3).value || "A1").trim();

        if (roll && studentName) {
          parsedStudents.push({ rollNo: roll, name: studentName, batchName });
        }
      });

      if (parsedStudents.length === 0) {
        alert("No valid student rows found in Excel sheet. Make sure columns are: RollNo, Name, Batch");
        return;
      }

      const count = await bulkImportStudents(parsedStudents, importDivisionId);
      alert(`Successfully imported ${count} students!`);
      setShowImportModal(false);
    } catch (err: any) {
      alert(err.message || "Error reading Excel file");
    } finally {
      setImportLoading(false);
    }
  };

  const filteredStudents = initialStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      String(student.rollNo).includes(search);
    const matchesDiv =
      selectedDivisionFilter === "ALL" || student.divisionId === selectedDivisionFilter;
    return matchesSearch && matchesDiv;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search roll no or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Division Filter */}
          <select
            value={selectedDivisionFilter}
            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Division</th>
                <th className="px-6 py-3.5">Batch</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3 font-bold text-blue-400">{student.rollNo}</td>
                    <td className="px-6 py-3 font-semibold text-white">{student.name}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[11px]">
                        {student.division.name}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[11px]">
                        Batch {student.batch.name}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete student ${student.name} (Roll ${student.rollNo})?`)) {
                            deleteStudent(student.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Add Single Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Roll Number
                </label>
                <input
                  type="number"
                  required
                  placeholder="31049"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
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
                  placeholder="Student Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Division
                  </label>
                  <select
                    value={divisionId}
                    onChange={(e) => {
                      setDivisionId(e.target.value);
                      const div = divisions.find((d) => d.id === e.target.value);
                      if (div?.batches[0]) setBatchId(div.batches[0].id);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Batch
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {loading ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Bulk Student Import (Excel)</span>
            </h3>

            <p className="text-xs text-slate-400">
              Upload an Excel file (.xlsx) with columns: <br />
              <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                Col 1: RollNo | Col 2: Name | Col 3: Batch
              </code>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Target Division
              </label>
              <select
                value={importDivisionId}
                onChange={(e) => setImportDivisionId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Select Excel File (.xlsx)
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                disabled={importLoading}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>

            {importLoading && (
              <p className="text-xs text-emerald-400 font-semibold animate-pulse text-center">
                Processing Excel sheet & creating student accounts...
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
