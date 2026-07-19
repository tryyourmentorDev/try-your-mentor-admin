"use server";

import { APIResponse } from "@/constants/common";
import { WeeklyScheduleRow } from "@/entities/weekly-schedule-entity";
import { http } from "@/utils/api";

function mapRow(row: any): WeeklyScheduleRow {
  return {
    weekday: row.weekday,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),
    timezone: row.timezone ?? "UTC",
  };
}

export async function getWeeklyScheduleAction(
  mentorId: number
): Promise<APIResponse<WeeklyScheduleRow[]>> {
  const response = await http({
    url: `/mentors/${mentorId}/weekly-schedule`,
    method: "GET",
  });

  if (response.error) return response;

  return { error: false, data: response.data.map(mapRow) };
}

export async function replaceWeeklyScheduleAction(
  mentorId: number,
  rows: WeeklyScheduleRow[]
): Promise<APIResponse<WeeklyScheduleRow[]>> {
  const response = await http({
    url: `/mentors/${mentorId}/weekly-schedule`,
    method: "PUT",
    body: {
      schedule: rows.map((row) => ({
        weekday: row.weekday,
        start_time: row.startTime,
        end_time: row.endTime,
        timezone: row.timezone || "UTC",
      })),
    },
  });

  if (response.error) return response;

  return { error: false, data: response.data.map(mapRow) };
}
