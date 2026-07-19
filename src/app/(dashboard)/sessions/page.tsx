"use client";
import React, { useEffect, useMemo, useState } from "react";
import BigCalendar, { CalendarEvent } from "@/components/BigCalender";
import { getMentorListAction } from "@/actions/mentor";
import { getAvailabilitySlotsAction } from "@/actions/availabilitySlot";
import {
  getBookingListAction,
  createBookingAction,
  updateBookingAction,
  cancelBookingAction,
} from "@/actions/booking";
import { Mentor } from "@/entities/mentor-entity";
import { Booking } from "@/entities/booking-entity";
import { AvailabilitySlot } from "@/entities/availability-slot-entity";

// India-based product: render all times in IST regardless of the viewer.
const IST = "Asia/Kolkata";

const slotLabel = (slot: AvailabilitySlot) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const d = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: IST,
  });
  const t = (dt: Date) =>
    dt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: IST,
    });
  return `${d}, ${t(start)} – ${t(end)} IST`;
};

const SessionManagerPage = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Create-form state
  const [mentorId, setMentorId] = useState<number | "">("");
  const [freeSlots, setFreeSlots] = useState<AvailabilitySlot[]>([]);
  const [slotId, setSlotId] = useState<number | "">("");
  const [menteeEmail, setMenteeEmail] = useState("");
  const [menteeFirstName, setMenteeFirstName] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  // Selected booking (for the update panel)
  const [selected, setSelected] = useState<Booking | null>(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState<number | "">("");

  const flash = (m: string) => {
    setMessage(m);
    setError(null);
  };
  const fail = (m: string) => {
    setError(m);
    setMessage(null);
  };

  const loadBookings = async () => {
    const res = await getBookingListAction();
    if (res.error) return fail(res.message ?? "Failed to load bookings");
    setBookings(res.data ?? []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [mentorRes, bookingRes] = await Promise.all([
        getMentorListAction(),
        getBookingListAction(),
      ]);
      if (mentorRes.error) fail(mentorRes.message ?? "Failed to load mentors");
      else setMentors(mentorRes.data ?? []);
      if (bookingRes.error)
        fail(bookingRes.message ?? "Failed to load bookings");
      else setBookings(bookingRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  // Load the chosen mentor's free slots for the create form.
  useEffect(() => {
    if (mentorId === "") {
      setFreeSlots([]);
      setSlotId("");
      return;
    }
    (async () => {
      const res = await getAvailabilitySlotsAction(Number(mentorId));
      if (!res.error && res.data) {
        setFreeSlots(res.data.filter((s) => s.state === "free"));
      }
    })();
  }, [mentorId]);

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== "cancelled")
        .map((b) => ({
          id: b.id,
          title: `${b.menteeName || b.menteeEmail || "Mentee"} · ${
            b.mentorName || "Mentor"
          }`,
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          resource: b,
        })),
    [bookings]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorId === "" || slotId === "" || !menteeEmail.trim()) {
      fail("Mentor, slot, and mentee email are required.");
      return;
    }
    setBusy(true);
    const res = await createBookingAction({
      mentorId: Number(mentorId),
      slotId: Number(slotId),
      menteeEmail: menteeEmail.trim(),
      menteeFirstName: menteeFirstName.trim() || undefined,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (res.error) return fail(res.message ?? "Failed to create booking");
    flash("Session booked.");
    setSlotId("");
    setMenteeEmail("");
    setMenteeFirstName("");
    setTitle("");
    setNotes("");
    await loadBookings();
    // Refresh free slots (the one we just booked is now taken).
    const slotsRes = await getAvailabilitySlotsAction(Number(mentorId));
    if (!slotsRes.error && slotsRes.data)
      setFreeSlots(slotsRes.data.filter((s) => s.state === "free"));
  };

  const handleSelectEvent = (event: any) => {
    setSelected(event.resource as Booking);
    setRescheduleSlotId("");
    setMessage(null);
    setError(null);
  };

  const changeStatus = async (status: "completed" | "cancelled") => {
    if (!selected) return;
    setBusy(true);
    const res =
      status === "cancelled"
        ? await cancelBookingAction(selected.id)
        : await updateBookingAction(selected.id, { status });
    setBusy(false);
    if (res.error) return fail(res.message ?? "Failed to update booking");
    flash(status === "cancelled" ? "Booking cancelled." : "Marked completed.");
    setSelected(null);
    await loadBookings();
  };

  const reschedule = async () => {
    if (!selected || rescheduleSlotId === "") return;
    setBusy(true);
    const res = await updateBookingAction(selected.id, {
      slotId: Number(rescheduleSlotId),
    });
    setBusy(false);
    if (res.error) return fail(res.message ?? "Failed to reschedule");
    flash("Booking rescheduled.");
    setSelected(null);
    await loadBookings();
  };

  // Free slots for the selected booking's mentor (for rescheduling).
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailabilitySlot[]>([]);
  useEffect(() => {
    if (!selected) {
      setRescheduleSlots([]);
      return;
    }
    (async () => {
      const res = await getAvailabilitySlotsAction(selected.mentorId);
      if (!res.error && res.data)
        setRescheduleSlots(res.data.filter((s) => s.state === "free"));
    })();
  }, [selected]);

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT: calendar */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Sessions</h1>
            {loading && (
              <span className="text-xs text-gray-400">Loading…</span>
            )}
          </div>
          <BigCalendar
            events={calendarEvents}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={() => setSelected(null)}
          />
        </div>
      </div>

      {/* RIGHT: create / manage */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {selected ? (
          <div className="bg-white p-4 rounded-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Manage session</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-gray-400"
              >
                Close
              </button>
            </div>
            <div className="text-sm flex flex-col gap-1">
              <p>
                <span className="text-gray-400">Mentee: </span>
                {selected.menteeName || selected.menteeEmail}
              </p>
              <p>
                <span className="text-gray-400">Mentor: </span>
                {selected.mentorName ?? "—"}
              </p>
              <p>
                <span className="text-gray-400">When: </span>
                {new Date(selected.startTime).toLocaleString(undefined, {
                  timeZone: IST,
                })}{" "}
                IST
              </p>
              <p>
                <span className="text-gray-400">Status: </span>
                {selected.status}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => changeStatus("completed")}
                disabled={busy || selected.status !== "reserved"}
                className="text-sm px-3 py-2 rounded-md bg-green-100 text-green-700 disabled:opacity-40"
              >
                Mark completed
              </button>
              <button
                onClick={() => changeStatus("cancelled")}
                disabled={busy || selected.status === "cancelled"}
                className="text-sm px-3 py-2 rounded-md bg-red-100 text-red-700 disabled:opacity-40"
              >
                Cancel booking
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
              <label className="text-xs text-gray-500">
                Reschedule to another free slot
              </label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                value={rescheduleSlotId}
                onChange={(e) =>
                  setRescheduleSlotId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">Select a slot</option>
                {rescheduleSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {slotLabel(s)}
                  </option>
                ))}
              </select>
              <button
                onClick={reschedule}
                disabled={busy || rescheduleSlotId === ""}
                className="self-start text-sm px-3 py-2 rounded-md bg-lamaSky disabled:opacity-40"
              >
                Reschedule
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-md flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Book a session</h2>
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Mentor</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  value={mentorId}
                  onChange={(e) =>
                    setMentorId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Select a mentor</option>
                  {mentors.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {[m.firstName, m.lastName].filter(Boolean).join(" ") ||
                        m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Free slot{" "}
                  {mentorId !== "" && freeSlots.length === 0 && (
                    <span className="text-red-400">
                      (no free slots for this mentor)
                    </span>
                  )}
                </label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  value={slotId}
                  disabled={mentorId === ""}
                  onChange={(e) =>
                    setSlotId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Select a slot</option>
                  {freeSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {slotLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Mentee email</label>
                <input
                  type="email"
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  value={menteeEmail}
                  onChange={(e) => setMenteeEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Mentee name (optional)
                </label>
                <input
                  type="text"
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  value={menteeFirstName}
                  onChange={(e) => setMenteeFirstName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Title (optional)</label>
                <input
                  type="text"
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Notes (optional)</label>
                <textarea
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
              >
                {busy ? "Booking…" : "Book session"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagerPage;
