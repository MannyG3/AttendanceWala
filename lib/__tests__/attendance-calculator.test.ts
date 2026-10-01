import { describe, it, expect } from "vitest";
import {
  calculateAttendancePercentage,
  calculateShortageLectures,
  calculatePresentDayStatus,
  AttendanceRecordInput,
} from "../attendance-calculator";

describe("Attendance Calculator Core Logic", () => {
  describe("calculateAttendancePercentage", () => {
    it("returns 100% when total held sessions is 0", () => {
      const records: AttendanceRecordInput[] = [];
      expect(calculateAttendancePercentage(records, 0)).toBe(100);
    });

    it("calculates basic attendance correctly", () => {
      const records: AttendanceRecordInput[] = [
        { status: "PRESENT" },
        { status: "PRESENT" },
        { status: "PRESENT" },
        { status: "ABSENT" },
      ];
      // 3 present out of 4 held = 75%
      expect(calculateAttendancePercentage(records, 4)).toBe(75);
    });

    it("accounts for configurable LATE and OD weights", () => {
      const records: AttendanceRecordInput[] = [
        { status: "PRESENT" },
        { status: "LATE" },
        { status: "OD" },
        { status: "ABSENT" },
      ];
      // default weights: LATE = 1.0, OD = 1.0 -> 3 out of 4 = 75%
      expect(calculateAttendancePercentage(records, 4)).toBe(75);

      // custom weights: LATE = 0.5, OD = 1.0 -> (1 + 0.5 + 1 + 0) / 4 = 2.5 / 4 = 62.5%
      expect(
        calculateAttendancePercentage(records, 4, { lateWeight: 0.5, odWeight: 1.0 })
      ).toBe(62.5);
    });
  });

  describe("calculateShortageLectures", () => {
    it("returns 0 if already at or above 75%", () => {
      expect(calculateShortageLectures(75, 100, 75)).toBe(0);
      expect(calculateShortageLectures(80, 100, 75)).toBe(0);
    });

    it("calculates exact required lectures to reach 75%", () => {
      // 50 attended out of 100 held = 50%.
      // (50 + x) / (100 + x) >= 0.75 => 50 + x >= 75 + 0.75x => 0.25x >= 25 => x >= 100
      expect(calculateShortageLectures(50, 100, 75)).toBe(100);

      // 70 attended out of 100 held = 70%.
      // (70 + x) / (100 + x) >= 0.75 => 70 + x >= 75 + 0.75x => 0.25x >= 5 => x >= 20
      expect(calculateShortageLectures(70, 100, 75)).toBe(20);
    });
  });

  describe("calculatePresentDayStatus", () => {
    it("marks student as present if attended >= threshold percentage", () => {
      const dayRecords: AttendanceRecordInput[] = [
        { status: "PRESENT" },
        { status: "ABSENT" },
        { status: "PRESENT" },
        { status: "ABSENT" },
      ];
      // 2 / 4 = 50%, threshold = 50% => isPresent = true
      const result = calculatePresentDayStatus(dayRecords, 4, {
        presentDayThresholdPercent: 50,
      });
      expect(result.isPresent).toBe(true);
      expect(result.percentage).toBe(50);
    });

    it("marks student as absent if attended < threshold percentage", () => {
      const dayRecords: AttendanceRecordInput[] = [
        { status: "PRESENT" },
        { status: "ABSENT" },
        { status: "ABSENT" },
        { status: "ABSENT" },
      ];
      // 1 / 4 = 25%, threshold = 50% => isPresent = false
      const result = calculatePresentDayStatus(dayRecords, 4, {
        presentDayThresholdPercent: 50,
      });
      expect(result.isPresent).toBe(false);
      expect(result.percentage).toBe(25);
    });
  });
});
