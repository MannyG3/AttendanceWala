"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "Mark", icon: "✓" },
  { href: "/students", label: "Students", icon: "👥" },
  { href: "/summary", label: "Summary", icon: "📊" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-semibold text-brand-700">
          {APP_NAME}
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>
      <nav className="mx-auto flex max-w-3xl border-t border-gray-100">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                active
                  ? "border-b-2 border-brand-600 text-brand-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
