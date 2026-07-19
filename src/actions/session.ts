"use server";

import { APIResponse } from "@/constants/common";
import {
  Session,
  SessionFormInput,
  UpdateSessionInput,
} from "@/entities/session-entity";
import { http } from "@/utils/api";

function mapSession(s: any): Session {
  return {
    id: s.id,
    bookingId: s.booking_id ?? null,
    mentorId: s.mentor_id ?? null,
    mentorName: s.mentor_name ?? null,
    menteeId: s.mentee_id,
    menteeName: s.mentee_name ?? null,
    menteeEmail: s.mentee_email ?? null,
    scheduledAt: s.scheduled_at,
    sessionType: s.session_type ?? null,
    status: s.status,
    contacted: Boolean(s.contacted),
    contactedAt: s.contacted_at ?? null,
    meetingLink: s.meeting_link ?? null,
    createdAt: s.created_at,
  };
}

export async function getSessionListAction(filters?: {
  mentorId?: number;
  status?: string;
  contacted?: boolean;
  search?: string;
}): Promise<APIResponse<Session[]>> {
  const params: Record<string, string> = {};
  if (filters?.mentorId) params.mentor_id = String(filters.mentorId);
  if (filters?.status) params.status = filters.status;
  if (filters?.contacted !== undefined) params.contacted = String(filters.contacted);
  if (filters?.search) params.search = filters.search;

  const response = await http({
    url: "/sessions",
    method: "GET",
    ...(Object.keys(params).length ? { params } : {}),
  });

  if (response.error) return response;

  return { error: false, data: response.data.map(mapSession) };
}

export async function getSessionAction(
  id: number
): Promise<APIResponse<Session>> {
  const response = await http({ url: `/sessions/${id}`, method: "GET" });
  if (response.error) return response;
  return { error: false, data: mapSession(response.data) };
}

export async function createSessionAction(
  input: SessionFormInput
): Promise<APIResponse<Session>> {
  const response = await http({
    url: "/sessions",
    method: "POST",
    body: {
      mentor_id: input.mentorId,
      mentee_email: input.menteeEmail,
      mentee_first_name: input.menteeFirstName || undefined,
      mentee_last_name: input.menteeLastName || undefined,
      scheduled_at: input.scheduledAt,
      session_type: input.sessionType || undefined,
      meeting_link: input.meetingLink || undefined,
      status: input.status || undefined,
    },
  });

  if (response.error) return response;
  return { error: false, data: mapSession(response.data) };
}

export async function updateSessionAction(
  id: number,
  input: UpdateSessionInput
): Promise<APIResponse<Session>> {
  const response = await http({
    url: `/sessions/${id}`,
    method: "PATCH",
    body: {
      status: input.status,
      scheduled_at: input.scheduledAt,
      session_type: input.sessionType,
      meeting_link: input.meetingLink,
      contacted: input.contacted,
    },
  });

  if (response.error) return response;
  return { error: false, data: mapSession(response.data) };
}

export async function deleteSessionAction(
  id: number
): Promise<APIResponse<{ id: number }>> {
  const response = await http({ url: `/sessions/${id}`, method: "DELETE" });
  if (response.error) return response;
  return { error: false, data: response.data };
}
