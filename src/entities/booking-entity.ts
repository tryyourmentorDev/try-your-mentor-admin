export type BookingStatus = "reserved" | "completed" | "cancelled";

// A booking = a session: a mentee booked into one of a mentor's slots.
export interface Booking {
  id: number;
  mentorId: number;
  menteeId: number;
  slotId: number | null;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  status: BookingStatus;
  title: string | null;
  notes: string | null;
  createdAt: string;
  mentorName: string | null;
  menteeName: string | null;
  menteeEmail: string | null;
}

export interface CreateBookingInput {
  mentorId: number;
  slotId: number;
  menteeEmail: string;
  menteeFirstName?: string;
  menteeLastName?: string;
  title?: string;
  notes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  slotId?: number;
  title?: string;
  notes?: string;
}
