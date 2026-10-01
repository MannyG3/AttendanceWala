import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./_components/SettingsClient";

export default async function SettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Parameters & Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure rule weights, present-day calculation threshold, and faculty attendance edit locking duration.
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
