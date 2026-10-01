import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { HodNavClient } from "./_components/HodNavClient";

export default async function HodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !["HOD", "ADMIN"].includes(user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <HodNavClient userName={user.name} userRole={user.role}>
        {children}
      </HodNavClient>
    </div>
  );
}
