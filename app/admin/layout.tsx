import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  Settings,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { AdminNavClient } from "./_components/AdminNavClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation for Desktop & Mobile */}
      <AdminNavClient userName={user.name} userEmail={user.email}>
        {children}
      </AdminNavClient>
    </div>
  );
}
