"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, Calendar, FileText, LogOut } from "lucide-react";

export function StudentNavClient({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight">{userName}</h1>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Student Portal</span>
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
          href="/student"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            pathname === "/student" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/student/leave"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            pathname.startsWith("/student/leave") ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Leave / OD</span>
        </Link>
      </nav>
    </div>
  );
}
