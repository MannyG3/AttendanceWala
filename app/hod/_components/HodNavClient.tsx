"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Award, FileCheck, BarChart3, LogOut, ShieldCheck, History } from "lucide-react";

export function HodNavClient({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight">{userName}</h1>
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">HOD Portal</span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 pb-20">{children}</main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-6 py-2 flex items-center justify-around z-30 shadow-2xl">
        <Link
          href="/hod"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            pathname === "/hod" ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Defaulters & Dashboard</span>
        </Link>

        <Link
          href="/hod/audit"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            pathname.startsWith("/hod/audit") ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <History className="w-5 h-5" />
          <span>Audit Trail</span>
        </Link>

        <Link
          href="/reports"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            pathname.startsWith("/reports") ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </Link>
      </nav>
    </div>
  );
}
