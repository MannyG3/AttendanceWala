import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { StudentNavClient } from "./_components/StudentNavClient";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <StudentNavClient userName={user.name} userEmail={user.email}>
        {children}
      </StudentNavClient>
    </div>
  );
}
