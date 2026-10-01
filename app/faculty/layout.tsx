import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { GraduationCap, Calendar, BarChart3, LogOut, User } from "lucide-react";
import { FacultyNavClient } from "./_components/FacultyNavClient";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !["FACULTY", "HOD", "ADMIN"].includes(user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <FacultyNavClient userName={user.name} userRole={user.role}>
        {children}
      </FacultyNavClient>
    </div>
  );
}
