export type AttendanceStatus = "present" | "absent";

export interface Student {
  id: string;
  roll_no: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  marked_at: string;
}

export interface AttendanceEntry {
  student_id: string;
  status: AttendanceStatus;
}

export interface SummaryRow {
  student_id: string;
  roll_no: number;
  name: string;
  days_present: number;
  total_marked: number;
  attendance_pct: number;
}

export interface DailyLogRow {
  date: string;
  records: Record<string, AttendanceStatus>;
}
