"use client";

import { useState, useTransition } from "react";
import {
  getAvailabilitySlotsAction,
  createAvailabilitySlotAction,
  generateAvailabilitySlotsAction,
  toggleAvailabilitySlotAction,
  deleteAvailabilitySlotAction,
} from "@/actions/availabilitySlot";
import { replaceWeeklyScheduleAction } from "@/actions/weeklySchedule";
import {
  AvailabilitySlot,
  SlotState,
} from "@/entities/availability-slot-entity";
import { WeeklyScheduleRow } from "@/entities/weekly-schedule-entity";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const STATE_STYLES: Record<SlotState, string> = {
  free: "bg-green-100 text-green-700",
  booked: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-200 text-gray-600",
  past: "bg-gray-100 text-gray-400",
};

type WeeklyRowState = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

const buildWeeklyState = (rows: WeeklyScheduleRow[]): WeeklyRowState[] =>
  WEEKDAYS.map((day) => {
    const existing = rows.find((r) => r.weekday === day.value);
    return {
      weekday: day.value,
      enabled: Boolean(existing),
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "17:00",
    };
  });

// This is an India-based product: all availability is expressed in IST, and the
// UI renders every time in IST regardless of the admin's machine timezone.
const IST = "Asia/Kolkata";

const formatDateHeading = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: IST,
  });

const formatTimeRange = (start: string, end: string) => {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST,
  };
  return `${new Date(start).toLocaleTimeString(undefined, opts)} – ${new Date(
    end,
  ).toLocaleTimeString(undefined, opts)}`;
};

const AvailabilityManager = ({
  mentorId,
  initialWeekly,
  initialSlots,
}: {
  mentorId: number;
  initialWeekly: WeeklyScheduleRow[];
  initialSlots: AvailabilitySlot[];
}) => {
  const [weekly, setWeekly] = useState<WeeklyRowState[]>(
    buildWeeklyState(initialWeekly),
  );
  const [timezone, setTimezone] = useState(initialWeekly[0]?.timezone ?? IST);
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Generate-form state
  const today = new Date().toISOString().slice(0, 10);
  const [genFrom, setGenFrom] = useState(today);
  const [genTo, setGenTo] = useState(today);
  const [genMinutes, setGenMinutes] = useState(60);

  // Manual-add form state
  const [addDate, setAddDate] = useState(today);
  const [addStart, setAddStart] = useState("09:00");
  const [addEnd, setAddEnd] = useState("10:00");

  const refreshSlots = async () => {
    const res = await getAvailabilitySlotsAction(mentorId);
    if (!res.error && res.data) setSlots(res.data);
  };

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
  };
  const fail = (msg: string) => {
    setError(msg);
    setMessage(null);
  };

  const updateWeeklyRow = (weekday: number, patch: Partial<WeeklyRowState>) => {
    setWeekly((prev) =>
      prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)),
    );
  };

  const saveWeekly = () => {
    setError(null);
    setMessage(null);
    const rows: WeeklyScheduleRow[] = weekly
      .filter((r) => r.enabled)
      .map((r) => ({
        weekday: r.weekday,
        startTime: r.startTime,
        endTime: r.endTime,
        timezone,
      }));

    const invalid = rows.find((r) => r.startTime >= r.endTime);
    if (invalid) {
      fail("Each enabled day's start time must be before its end time.");
      return;
    }

    startTransition(async () => {
      const res = await replaceWeeklyScheduleAction(mentorId, rows);
      if (res.error)
        return fail(res.message ?? "Failed to save weekly template");
      flash("Weekly template saved.");
    });
  };

  const generate = () => {
    startTransition(async () => {
      const res = await generateAvailabilitySlotsAction(mentorId, {
        fromDate: genFrom,
        toDate: genTo,
        slotMinutes: genMinutes,
      });
      if (res.error) return fail(res.message ?? "Failed to generate slots");
      await refreshSlots();
      flash(
        `Generated ${res.data?.created ?? 0} slot(s); skipped ${
          res.data?.skipped ?? 0
        } overlapping/past.`,
      );
    });
  };

  const addManual = () => {
    // The date/time inputs are IST wall-clock. Pin them to IST (+05:30, no DST)
    // so the stored instant is correct no matter the admin's machine timezone.
    const startIso = new Date(`${addDate}T${addStart}:00+05:30`).toISOString();
    const endIso = new Date(`${addDate}T${addEnd}:00+05:30`).toISOString();
    if (startIso >= endIso) {
      fail("Slot start must be before end.");
      return;
    }
    startTransition(async () => {
      const res = await createAvailabilitySlotAction(mentorId, {
        startTime: startIso,
        endTime: endIso,
      });
      if (res.error) return fail(res.message ?? "Failed to add slot");
      await refreshSlots();
      flash("Slot added.");
    });
  };

  const toggleSlot = (slot: AvailabilitySlot) => {
    startTransition(async () => {
      const res = await toggleAvailabilitySlotAction(
        mentorId,
        slot.id,
        !slot.isActive,
      );
      if (res.error) return fail(res.message ?? "Failed to toggle slot");
      await refreshSlots();
    });
  };

  const removeSlot = (slot: AvailabilitySlot) => {
    startTransition(async () => {
      const res = await deleteAvailabilitySlotAction(mentorId, slot.id);
      if (res.error) return fail(res.message ?? "Failed to delete slot");
      await refreshSlots();
    });
  };

  // Group slots by calendar date for display.
  const grouped = slots.reduce<Record<string, AvailabilitySlot[]>>((acc, s) => {
    const key = new Date(s.startTime).toISOString().slice(0, 10);
    (acc[key] ??= []).push(s);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped).sort();

  return (
    <div className="mt-4 bg-white p-4 rounded-md flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Availability</h2>
        {isPending && <span className="text-xs text-gray-400">Saving…</span>}
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Weekly template */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-gray-400 font-medium">
            Weekly template
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Timezone</label>
            <input
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-xs w-56"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Asia/Colombo"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {weekly.map((row) => (
            <div
              key={row.weekday}
              className="flex items-center gap-3 flex-wrap"
            >
              <label className="flex items-center gap-2 w-32">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    updateWeeklyRow(row.weekday, { enabled: e.target.checked })
                  }
                />
                <span className="text-sm">{WEEKDAYS[row.weekday].label}</span>
              </label>
              <input
                type="time"
                className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm disabled:opacity-50"
                value={row.startTime}
                disabled={!row.enabled}
                onChange={(e) =>
                  updateWeeklyRow(row.weekday, { startTime: e.target.value })
                }
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time"
                className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm disabled:opacity-50"
                value={row.endTime}
                disabled={!row.enabled}
                onChange={(e) =>
                  updateWeeklyRow(row.weekday, { endTime: e.target.value })
                }
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveWeekly}
          disabled={isPending}
          className="self-start bg-lamaPurple text-sm px-4 py-2 rounded-md disabled:opacity-60"
        >
          Save weekly template
        </button>
      </section>

      {/* Generate slots */}
      <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-400 font-medium">
          Generate slots from weekly template
        </span>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={genFrom}
              onChange={(e) => setGenFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={genTo}
              onChange={(e) => setGenTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Slot length</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={genMinutes}
              onChange={(e) => setGenMinutes(Number(e.target.value))}
            >
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </select>
          </div>
          <button
            onClick={generate}
            disabled={isPending}
            className="bg-lamaSky text-sm px-4 py-2 rounded-md disabled:opacity-60"
          >
            Generate
          </button>
        </div>
      </section>

      {/* Manual add */}
      <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-400 font-medium">
          Add a single slot
        </span>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Date</label>
            <input
              type="date"
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Start</label>
            <input
              type="time"
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={addStart}
              onChange={(e) => setAddStart(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">End</label>
            <input
              type="time"
              className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm"
              value={addEnd}
              onChange={(e) => setAddEnd(e.target.value)}
            />
          </div>
          <button
            onClick={addManual}
            disabled={isPending}
            className="bg-lamaYellow text-sm px-4 py-2 rounded-md disabled:opacity-60"
          >
            Add slot
          </button>
        </div>
      </section>

      {/* Slot list */}
      <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-400 font-medium">
          Slots ({slots.length})
        </span>
        {groupKeys.length === 0 && (
          <p className="text-sm text-gray-500">
            No slots yet. Generate from the weekly template or add one manually.
          </p>
        )}
        {groupKeys.map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-gray-600">
              {formatDateHeading(grouped[key][0].startTime)}
            </h4>
            <div className="flex flex-col gap-1">
              {grouped[key].map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-3 flex-wrap border border-gray-100 rounded-md px-3 py-2"
                >
                  <span className="text-sm">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATE_STYLES[slot.state]
                      }`}
                    >
                      {slot.state}
                    </span>
                    <button
                      onClick={() => toggleSlot(slot)}
                      disabled={isPending || slot.state === "past"}
                      className="text-xs px-2 py-1 rounded-md ring-[1.5px] ring-gray-300 disabled:opacity-40"
                    >
                      {slot.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => removeSlot(slot)}
                      disabled={isPending || slot.state === "booked"}
                      title={
                        slot.state === "booked"
                          ? "Cancel the booking before deleting"
                          : "Delete slot"
                      }
                      className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AvailabilityManager;
