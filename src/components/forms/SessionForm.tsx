"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSessionAction,
  updateSessionAction,
} from "../../actions/session";
import { Session } from "../../entities/session-entity";
import { Mentor } from "../../entities/mentor-entity";
import { SESSION_STATUSES, SessionStatus } from "../../lib/settings";

const IST = "Asia/Kolkata";

// ISO instant -> "YYYY-MM-DDTHH:mm" wall-clock in IST for a datetime-local input.
const isoToIstLocal = (iso?: string) => {
  if (!iso) return "";
  // sv-SE renders as "YYYY-MM-DD HH:mm:ss"; take date + HH:mm.
  const s = new Date(iso).toLocaleString("sv-SE", { timeZone: IST });
  return s.slice(0, 16).replace(" ", "T");
};

// datetime-local IST wall-clock -> ISO instant (IST is +05:30, no DST).
const istLocalToIso = (local: string) =>
  local ? new Date(`${local}:00+05:30`).toISOString() : "";

const SessionForm = ({
  type,
  data,
  mentors,
  onSuccess,
}: {
  type: "create" | "update";
  data?: Session;
  mentors: Mentor[];
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [mentorId, setMentorId] = useState<number | "">(data?.mentorId ?? "");
  const [menteeEmail, setMenteeEmail] = useState(data?.menteeEmail ?? "");
  const [menteeFirstName, setMenteeFirstName] = useState("");
  const [scheduledAt, setScheduledAt] = useState(isoToIstLocal(data?.scheduledAt));
  const [sessionType, setSessionType] = useState(data?.sessionType ?? "");
  const [meetingLink, setMeetingLink] = useState(data?.meetingLink ?? "");
  const [status, setStatus] = useState<SessionStatus>(data?.status ?? "booked");
  const [contacted, setContacted] = useState(Boolean(data?.contacted));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!scheduledAt) {
      setError("Scheduled date/time is required.");
      return;
    }
    if (type === "create" && (mentorId === "" || !menteeEmail.trim())) {
      setError("Mentor and mentee email are required.");
      return;
    }

    setSaving(true);
    const scheduledIso = istLocalToIso(scheduledAt);

    const response =
      type === "create"
        ? await createSessionAction({
            mentorId: Number(mentorId),
            menteeEmail: menteeEmail.trim(),
            menteeFirstName: menteeFirstName.trim() || undefined,
            scheduledAt: scheduledIso,
            sessionType: sessionType.trim() || undefined,
            meetingLink: meetingLink.trim() || undefined,
            status,
          })
        : await updateSessionAction(data!.id, {
            status,
            scheduledAt: scheduledIso,
            sessionType: sessionType.trim() || undefined,
            meetingLink: meetingLink.trim() || undefined,
            contacted,
          });

    setSaving(false);
    if (response.error) {
      setError(response.message ?? "Something went wrong");
      return;
    }
    router.refresh();
    onSuccess?.();
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a session" : "Update session"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mentor */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Mentor</label>
          {type === "create" ? (
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
              value={mentorId}
              onChange={(e) =>
                setMentorId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Select a mentor</option>
              {mentors.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm p-2">{data?.mentorName ?? "—"}</span>
          )}
        </div>

        {/* Mentee */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Mentee email</label>
          {type === "create" ? (
            <input
              type="email"
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
              value={menteeEmail}
              onChange={(e) => setMenteeEmail(e.target.value)}
            />
          ) : (
            <span className="text-sm p-2">
              {data?.menteeName || data?.menteeEmail || "—"}
            </span>
          )}
        </div>

        {type === "create" && (
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Mentee name (optional)</label>
            <input
              type="text"
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
              value={menteeFirstName}
              onChange={(e) => setMenteeFirstName(e.target.value)}
            />
          </div>
        )}

        {/* Scheduled at (IST) */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Scheduled at (IST)</label>
          <input
            type="datetime-local"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Status</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionStatus)}
          >
            {SESSION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Session type */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Session type (optional)</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          />
        </div>

        {/* Meeting link */}
        <div className="flex flex-col gap-2 w-full sm:col-span-2">
          <label className="text-xs text-gray-500">Meeting link (optional)</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
        </div>

        {/* Contacted (edit only) */}
        {type === "update" && (
          <label className="flex items-center gap-2 w-full sm:col-span-2">
            <input
              type="checkbox"
              checked={contacted}
              onChange={(e) => setContacted(e.target.checked)}
            />
            <span className="text-sm">Mentee contacted by mentor</span>
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto sm:self-end sm:px-8 bg-blue-400 text-white p-2 rounded-md disabled:opacity-60 hover:bg-blue-500 transition-colors"
      >
        {saving ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SessionForm;
