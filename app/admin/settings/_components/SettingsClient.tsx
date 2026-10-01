"use client";

import { useState } from "react";
import { updateSettings } from "../actions";
import { Settings, Save, ShieldCheck, CheckCircle } from "lucide-react";

interface SettingsItem {
  id: string;
  lateWeight: number;
  odWeight: number;
  presentDayThresholdPercent: number;
  editingLockHours: number;
}

export function SettingsClient({ initialSettings }: { initialSettings: SettingsItem | null }) {
  const [lateWeight, setLateWeight] = useState(initialSettings?.lateWeight ?? 1.0);
  const [odWeight, setOdWeight] = useState(initialSettings?.odWeight ?? 1.0);
  const [presentDayThresholdPercent, setPresentDayThresholdPercent] = useState(
    initialSettings?.presentDayThresholdPercent ?? 50.0
  );
  const [editingLockHours, setEditingLockHours] = useState(
    initialSettings?.editingLockHours ?? 24
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateSettings(
        lateWeight,
        odWeight,
        presentDayThresholdPercent,
        editingLockHours
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Attendance Percentage Weights</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              LATE Status Weight (0.0 to 1.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              required
              value={lateWeight}
              onChange={(e) => setLateWeight(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Weight assigned when a student is marked LATE. (Default 1.0 = full credit).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              OD (On-Duty) Status Weight (0.0 to 1.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              required
              value={odWeight}
              onChange={(e) => setOdWeight(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Weight assigned for On-Duty (OD) approved requests. (Default 1.0).
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-1">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>Present Day Rule & Lock Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Present-Day Threshold (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={presentDayThresholdPercent}
              onChange={(e) => setPresentDayThresholdPercent(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Min % of periods held in a day a student must attend to count as &quot;Present&quot; for that day (Default 50%).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Faculty Editing Lock Hours
            </label>
            <input
              type="number"
              min="1"
              max="720"
              required
              value={editingLockHours}
              onChange={(e) => setEditingLockHours(parseInt(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Hours after marking during which faculty can edit session attendance before lock (Default 24h).
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
