import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date query param required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, roll_no, name")
      .eq("is_active", true)
      .order("roll_no");

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("date", date);

    if (attendanceError) {
      return NextResponse.json(
        { error: attendanceError.message },
        { status: 500 }
      );
    }

    const attendanceMap = new Map(
      (attendance ?? []).map((a) => [a.student_id, a.status])
    );

    const result = (students ?? []).map((s) => ({
      ...s,
      status: attendanceMap.get(s.id) ?? "present",
    }));

    const hasExisting = (attendance ?? []).length > 0;

    return NextResponse.json({ date, students: result, hasExisting });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, entries } = body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "entries array is required" },
        { status: 400 }
      );
    }

    const rows = entries.map(
      (e: { student_id: string; status: string }) => ({
        student_id: e.student_id,
        date,
        status: e.status,
        marked_at: new Date().toISOString(),
      })
    );

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "student_id,date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const present = rows.filter((r) => r.status === "present").length;
    const absent = rows.filter((r) => r.status === "absent").length;

    return NextResponse.json({
      success: true,
      summary: { present, absent, total: rows.length },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
