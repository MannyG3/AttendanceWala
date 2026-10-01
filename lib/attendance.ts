import { ATTENDANCE_THRESHOLD } from "./constants";
import { getSupabaseAdmin } from "./supabase";
import type { AttendanceStatus, SummaryRow } from "./types";

export function getMonthDateRange(month: string): {
  startDate: string;
  endDate: string;
} {
  const [year, mon] = month.split("-").map(Number);
  const startDate = `${month}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

export async function computeMonthlySummary(
  month: string
): Promise<{
  summary: SummaryRow[];
  dailyDates: string[];
  dailyGrid: Map<string, Map<string, AttendanceStatus>>;
}> {
  const supabase = getSupabaseAdmin();
  const { startDate, endDate } = getMonthDateRange(month);

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, roll_no, name")
    .eq("is_active", true)
    .order("roll_no");

  if (studentsError) throw studentsError;

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("student_id, date, status")
    .gte("date", startDate)
    .lte("date", endDate);

  if (attendanceError) throw attendanceError;

  const dailyDatesSet = new Set<string>();
  const dailyGrid = new Map<string, Map<string, AttendanceStatus>>();

  for (const record of attendance ?? []) {
    dailyDatesSet.add(record.date);
    if (!dailyGrid.has(record.date)) {
      dailyGrid.set(record.date, new Map());
    }
    dailyGrid
      .get(record.date)!
      .set(record.student_id, record.status as AttendanceStatus);
  }

  const dailyDates = Array.from(dailyDatesSet).sort();

  const stats = new Map<
    string,
    { days_present: number; total_marked: number }
  >();

  for (const student of students ?? []) {
    stats.set(student.id, { days_present: 0, total_marked: 0 });
  }

  for (const record of attendance ?? []) {
    const stat = stats.get(record.student_id);
    if (!stat) continue;
    stat.total_marked += 1;
    if (record.status === "present") stat.days_present += 1;
  }

  const summary: SummaryRow[] = (students ?? []).map((student) => {
    const stat = stats.get(student.id) ?? { days_present: 0, total_marked: 0 };
    const attendance_pct =
      stat.total_marked > 0
        ? Math.round((stat.days_present / stat.total_marked) * 1000) / 10
        : 0;

    return {
      student_id: student.id,
      roll_no: student.roll_no,
      name: student.name,
      days_present: stat.days_present,
      total_marked: stat.total_marked,
      attendance_pct,
    };
  });

  summary.sort((a, b) => a.attendance_pct - b.attendance_pct);

  return { summary, dailyDates, dailyGrid };
}

export function filterDefaulters(
  summary: SummaryRow[],
  threshold = ATTENDANCE_THRESHOLD
): SummaryRow[] {
  return summary.filter(
    (row) => row.total_marked > 0 && row.attendance_pct < threshold
  );
}

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
