"use server";

import { APIResponse } from "@/constants/common";
import { http } from "@/utils/api";

export interface DashboardSummary {
  mentorCount: number;
  menteeCount: number;
  activeSessionCount: number;
  completedSessionCount: number;
}

export async function getDashboardSummaryAction(): Promise<
  APIResponse<DashboardSummary>
> {
  const response = await http({ url: "/dashboard/summary", method: "GET" });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: {
      mentorCount: response.data.mentor_count,
      menteeCount: response.data.mentee_count,
      activeSessionCount: response.data.active_session_count,
      completedSessionCount: response.data.completed_session_count,
    },
  };
}
