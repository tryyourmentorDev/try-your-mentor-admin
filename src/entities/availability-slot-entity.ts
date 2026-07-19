// A slot's derived state, mirrored from the admin-bff:
//   free     - bookable now
//   booked   - has an active (reserved/completed) booking
//   inactive - admin disabled it; mentees can't book
//   past     - start time is in the past
export type SlotState = "free" | "booked" | "inactive" | "past";

export interface AvailabilitySlot {
  id: number;
  mentorId: number;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  isActive: boolean;
  state: SlotState;
  bookingId: number | null;
}

export interface AvailabilitySlotFormInput {
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
}

export interface GenerateSlotsInput {
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  slotMinutes?: number;
}
