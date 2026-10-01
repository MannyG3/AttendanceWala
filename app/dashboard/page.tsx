import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "ADMIN":
      redirect("/admin");
    case "HOD":
      redirect("/hod");
    case "FACULTY":
      redirect("/faculty");
    case "STUDENT":
      redirect("/student");
    default:
      redirect("/login");
  }
}
