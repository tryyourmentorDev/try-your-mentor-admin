import { MENTOR_STATUSES, MentorStatus } from "@/lib/settings";

const STATUS_STYLES: Record<MentorStatus, string> = {
  approval_pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-200 text-gray-600",
};

const MentorStatusBadge = ({ status }: { status: MentorStatus | null }) => {
  if (!status) return <span className="text-gray-400">—</span>;

  const label =
    MENTOR_STATUSES.find((s) => s.value === status)?.label ?? status;

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

export default MentorStatusBadge;
