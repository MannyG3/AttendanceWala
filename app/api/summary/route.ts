import { NextRequest, NextResponse } from "next/server";
import {
  computeMonthlySummary,
  filterDefaulters,
} from "@/lib/attendance";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Valid month query param required (YYYY-MM)" },
        { status: 400 }
      );
    }

    const { summary, dailyDates } = await computeMonthlySummary(month);
    const defaulters = filterDefaulters(summary);

    return NextResponse.json({
      month,
      threshold: ATTENDANCE_THRESHOLD,
      summary,
      defaulters,
      dailyDates,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
