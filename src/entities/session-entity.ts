import { SessionStatus } from "@/lib/settings";
import { MenteeSnapshot } from "@/entities/booking-entity";

// A session is the admin-managed entity created for each mentor booking
// (bookingId links back to it; null for manually-added sessions).
export interface Session {
  id: number;
  bookingId: number | null;
  mentorId: number | null;
  mentorName: string | null;
  menteeId: number;
  menteeName: string | null;
  menteeEmail: string | null;
  scheduledAt: string; // ISO timestamp
  sessionType: string | null;
  status: SessionStatus;
  contacted: boolean;
  contactedAt: string | null;
  meetingLink: string | null;
  createdAt: string;
  menteeSnapshot: MenteeSnapshot | null;
}

// Fields the create/edit session form submits.
export interface SessionFormInput {
  mentorId: number;
  menteeEmail: string;
  menteeFirstName?: string;
  menteeLastName?: string;
  scheduledAt: string; // ISO timestamp
  sessionType?: string;
  meetingLink?: string;
  status?: SessionStatus;
}

export interface UpdateSessionInput {
  status?: SessionStatus;
  scheduledAt?: string;
  sessionType?: string;
  meetingLink?: string;
  contacted?: boolean;
}
