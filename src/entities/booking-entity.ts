export type BookingStatus = "reserved" | "completed" | "cancelled";
export type BookingConfirmationEmailStatus = "pending" | "sent" | "failed";

// Point-in-time snapshot of the mentee's onboarding selections, captured on the
// booking. Older bookings (pre-feature) have menteeSnapshot = null.
export interface MenteeSnapshot {
  expertise: string | null;
  goals: string[] | null;
  educationLevel: string | null;
  experienceLevel: string | null;
  jobRole: string | null;
}

// A booking is the mentee's raw reservation. Each has one linked session
// (session_status + contacted) that the admin manages separately.
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
  bookingConfirmationEmailStatus: BookingConfirmationEmailStatus | null;
  mentorName: string | null;
  menteeName: string | null;
  menteeEmail: string | null;
  sessionId: number | null;
  sessionStatus: string | null;
  contacted: boolean | null;
  menteeSnapshot: MenteeSnapshot | null;
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
