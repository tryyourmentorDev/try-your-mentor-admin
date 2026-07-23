"use server";

import { APIResponse } from "@/constants/common";
import {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/entities/booking-entity";
import { http } from "@/utils/api";

function mapBooking(b: any): Booking {
  return {
    id: b.mentor_booking_id,
    mentorId: b.mentor_id,
    menteeId: b.mentee_id,
    slotId: b.slot_id ?? null,
    startTime: b.start_time,
    endTime: b.end_time,
    status: b.status,
    title: b.title ?? null,
    notes: b.notes ?? null,
    createdAt: b.created_at,
    bookingConfirmationEmailStatus: b.booking_confirmation_email_status ?? null,
    mentorName: b.mentor_name ?? null,
    menteeName: b.mentee_name ?? null,
    menteeEmail: b.mentee_email ?? null,
    sessionId: b.session_id ?? null,
    sessionStatus: b.session_status ?? null,
    contacted: b.contacted ?? null,
    menteeSnapshot: b.mentee_snapshot ?? null,
  };
}

export async function getBookingListAction(filters?: {
  mentorId?: number;
  status?: string;
  from?: string;
  to?: string;
}): Promise<APIResponse<Booking[]>> {
  const params: Record<string, string> = {};
  if (filters?.mentorId) params.mentor_id = String(filters.mentorId);
  if (filters?.status) params.status = filters.status;
  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;

  const response = await http({
    url: "/bookings",
    method: "GET",
    ...(Object.keys(params).length ? { params } : {}),
  });

  if (response.error) return response;

  return { error: false, data: response.data.map(mapBooking) };
}

export async function createBookingAction(
  input: CreateBookingInput
): Promise<APIResponse<Booking>> {
  const response = await http({
    url: "/bookings",
    method: "POST",
    body: {
      mentor_id: input.mentorId,
      slot_id: input.slotId,
      mentee_email: input.menteeEmail,
      mentee_first_name: input.menteeFirstName || undefined,
      mentee_last_name: input.menteeLastName || undefined,
      title: input.title || undefined,
      notes: input.notes || undefined,
    },
  });

  if (response.error) return response;

  return { error: false, data: mapBooking(response.data) };
}

export async function updateBookingAction(
  bookingId: number,
  input: UpdateBookingInput
): Promise<APIResponse<Booking>> {
  const response = await http({
    url: `/bookings/${bookingId}`,
    method: "PATCH",
    body: {
      status: input.status,
      slot_id: input.slotId,
      title: input.title,
      notes: input.notes,
    },
  });

  if (response.error) return response;

  return { error: false, data: mapBooking(response.data) };
}

export async function cancelBookingAction(
  bookingId: number
): Promise<APIResponse<Booking>> {
  const response = await http({
    url: `/bookings/${bookingId}`,
    method: "DELETE",
  });

  if (response.error) return response;

  return { error: false, data: mapBooking(response.data) };
}
