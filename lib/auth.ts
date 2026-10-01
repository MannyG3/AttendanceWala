import { cookies } from "next/headers";

export const SESSION_COOKIE = "attendance_session";

export function getAuthPassword(): string {
  return process.env.AUTH_PASSWORD ?? "attendance2026";
}

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === "authenticated";
}

export function createSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "authenticated",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
