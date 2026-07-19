import { SESSION_STATUSES, SessionStatus } from "@/lib/settings";

const STATUS_STYLES: Record<SessionStatus, string> = {
  booked: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-purple-100 text-purple-700",
  inactive: "bg-gray-200 text-gray-600",
};

const SessionStatusBadge = ({ status }: { status: SessionStatus | null }) => {
  if (!status) return <span className="text-gray-400">—</span>;

  const label =
    SESSION_STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
};

export default SessionStatusBadge;
