import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Role-based path authorization
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/hod") && !["HOD", "ADMIN"].includes(role || "")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/faculty") && !["FACULTY", "HOD", "ADMIN"].includes(role || "")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "rit-polytechnic-attendance-secret-key-2026",
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/hod/:path*",
    "/faculty/:path*",
    "/student/:path*",
    "/reports/:path*",
    "/dashboard/:path*",
  ],
};
