"use server";

import { APIResponse } from "@/constants/common";
import {
  AvailabilitySlot,
  AvailabilitySlotFormInput,
  GenerateSlotsInput,
} from "@/entities/availability-slot-entity";
import { http } from "@/utils/api";

function mapSlot(slot: any): AvailabilitySlot {
  return {
    id: slot.id,
    mentorId: slot.mentor_id,
    startTime: slot.start_time,
    endTime: slot.end_time,
    isActive: slot.is_active,
    state: slot.state,
    bookingId: slot.booking_id ?? null,
  };
}

export async function getAvailabilitySlotsAction(
  mentorId: number,
  range?: { from?: string; to?: string }
): Promise<APIResponse<AvailabilitySlot[]>> {
  const params: Record<string, string> = {};
  if (range?.from) params.from = range.from;
  if (range?.to) params.to = range.to;

  const response = await http({
    url: `/mentors/${mentorId}/availability-slots`,
    method: "GET",
    ...(Object.keys(params).length ? { params } : {}),
  });

  if (response.error) return response;

  return { error: false, data: response.data.map(mapSlot) };
}

export async function createAvailabilitySlotAction(
  mentorId: number,
  input: AvailabilitySlotFormInput
): Promise<APIResponse<AvailabilitySlot>> {
  const response = await http({
    url: `/mentors/${mentorId}/availability-slots`,
    method: "POST",
    body: { start_time: input.startTime, end_time: input.endTime },
  });

  if (response.error) return response;

  return { error: false, data: mapSlot(response.data) };
}

export async function generateAvailabilitySlotsAction(
  mentorId: number,
  input: GenerateSlotsInput
): Promise<APIResponse<{ created: number; skipped: number }>> {
  const response = await http({
    url: `/mentors/${mentorId}/availability-slots/generate`,
    method: "POST",
    body: {
      from_date: input.fromDate,
      to_date: input.toDate,
      ...(input.slotMinutes ? { slot_minutes: input.slotMinutes } : {}),
    },
  });

  if (response.error) return response;

  return { error: false, data: response.data };
}

export async function toggleAvailabilitySlotAction(
  mentorId: number,
  slotId: number,
  isActive: boolean
): Promise<APIResponse<AvailabilitySlot>> {
  const response = await http({
    url: `/mentors/${mentorId}/availability-slots/${slotId}`,
    method: "PATCH",
    body: { is_active: isActive },
  });

  if (response.error) return response;

  return { error: false, data: mapSlot(response.data) };
}

export async function deleteAvailabilitySlotAction(
  mentorId: number,
  slotId: number
): Promise<APIResponse<{ id: number }>> {
  const response = await http({
    url: `/mentors/${mentorId}/availability-slots/${slotId}`,
    method: "DELETE",
  });

  if (response.error) return response;

  return { error: false, data: response.data };
}
