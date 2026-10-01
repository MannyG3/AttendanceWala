import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  ArrowUpRight,
  UserPlus,
  CalendarCheck,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    divisionCount,
    studentCount,
    facultyCount,
    subjectCount,
    slotCount,
  ] = await Promise.all([
    prisma.division.count(),
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.subject.count(),
    prisma.timetableSlot.count(),
  ]);

  const stats = [
    { label: "Divisions", count: divisionCount, icon: Building2, href: "/admin/divisions", color: "from-blue-600 to-indigo-600" },
    { label: "Total Students", count: studentCount, icon: GraduationCap, href: "/admin/students", color: "from-emerald-600 to-teal-600" },
    { label: "Faculty Members", count: facultyCount, icon: Users, href: "/admin/faculty", color: "from-purple-600 to-pink-600" },
    { label: "Subjects Catalog", count: subjectCount, icon: BookOpen, href: "/admin/subjects", color: "from-amber-600 to-orange-600" },
    { label: "Timetable Slots", count: slotCount, icon: CalendarDays, href: "/admin/timetable", color: "from-cyan-600 to-blue-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master System Administration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            RIT Polytechnic Admin Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Manage academic divisions, student rosters, faculty assignments, timetable slots, and system attendance parameters.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} text-white rounded-xl shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.count}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/students"
            className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition text-slate-200"
          >
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold">Bulk Student Import</span>
          </Link>
          <Link
            href="/admin/timetable"
            className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition text-slate-200"
          >
            <CalendarDays className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold">Edit Timetable</span>
          </Link>
          <Link
            href="/admin/calendar"
            className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition text-slate-200"
          >
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Setup Holidays</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition text-slate-200"
          >
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold">Rule Thresholds</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
