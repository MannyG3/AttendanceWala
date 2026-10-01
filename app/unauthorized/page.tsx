import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied</h1>
      <p className="text-slate-400 max-w-sm mb-6 text-sm">
        You do not have permission to access this page. Please contact your system administrator if you believe this is an error.
      </p>
      <Link
        href="/login"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
      >
        Return to Login
      </Link>
    </div>
  );
}
