// One row of a mentor's recurring weekly availability template.
// weekday: 0 = Sunday .. 6 = Saturday. Times are "HH:mm" / "HH:mm:ss".
export interface WeeklyScheduleRow {
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
}
