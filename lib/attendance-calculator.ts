export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "OD" | "LEAVE";

export interface AttendanceSettings {
  lateWeight: number;
  odWeight: number;
  presentDayThresholdPercent: number;
}

export const DEFAULT_SETTINGS: AttendanceSettings = {
  lateWeight: 1.0,
  odWeight: 1.0,
  presentDayThresholdPercent: 50.0,
};

export interface AttendanceRecordInput {
  status: AttendanceStatus;
}

/**
 * Computes attendance percentage based on held sessions and weighted statuses.
 * Excludes CANCELLED sessions and HOLIDAYS from total held count.
 */
export function calculateAttendancePercentage(
  records: AttendanceRecordInput[],
  totalHeldSessions: number,
  settings: Partial<AttendanceSettings> = {}
): number {
  if (totalHeldSessions <= 0) return 100.0;

  const lateWeight = settings.lateWeight ?? DEFAULT_SETTINGS.lateWeight;
  const odWeight = settings.odWeight ?? DEFAULT_SETTINGS.odWeight;

  let weightedAttended = 0;

  for (const record of records) {
    if (record.status === "PRESENT") {
      weightedAttended += 1.0;
    } else if (record.status === "LATE") {
      weightedAttended += lateWeight;
    } else if (record.status === "OD") {
      weightedAttended += odWeight;
    }
  }

  const percentage = (weightedAttended / totalHeldSessions) * 100;
  return Math.min(100.0, Math.round(percentage * 100) / 100);
}

/**
 * Calculates the number of additional lectures a student must attend consecutively
 * to reach the target attendance percentage (default 75%).
 */
export function calculateShortageLectures(
  attendedWeighted: number,
  totalHeld: number,
  targetPercent: number = 75.0
): number {
  if (totalHeld === 0) return 0;

  const currentPercent = (attendedWeighted / totalHeld) * 100;
  if (currentPercent >= targetPercent) return 0;

  const targetFraction = targetPercent / 100;
  // (attendedWeighted + x) / (totalHeld + x) >= targetFraction
  // attendedWeighted + x >= targetFraction * totalHeld + targetFraction * x
  // (1 - targetFraction) * x >= targetFraction * totalHeld - attendedWeighted
  // x >= (targetFraction * totalHeld - attendedWeighted) / (1 - targetFraction)
  const required = (targetFraction * totalHeld - attendedWeighted) / (1 - targetFraction);
  return Math.max(0, Math.ceil(required));
}

/**
 * Determines whether a student qualifies as "Present" for a full day based on total
 * held sessions on that day and the configured threshold (default 50%).
 */
export function calculatePresentDayStatus(
  dayRecords: AttendanceRecordInput[],
  totalDayHeldSessions: number,
  settings: Partial<AttendanceSettings> = {}
): { isPresent: boolean; percentage: number } {
  if (totalDayHeldSessions <= 0) {
    return { isPresent: true, percentage: 100.0 };
  }

  const threshold = settings.presentDayThresholdPercent ?? DEFAULT_SETTINGS.presentDayThresholdPercent;
  const percentage = calculateAttendancePercentage(dayRecords, totalDayHeldSessions, settings);

  return {
    isPresent: percentage >= threshold,
    percentage,
  };
}
