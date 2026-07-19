"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMentorStatusAction } from "@/actions/mentor";
import { MentorStatus } from "@/lib/settings";

// Standalone Active/Inactive toggle for the mentor profile view.
// 'approval_pending' is create-time-only and isn't reachable from here —
// the mentor becomes Active or Inactive, never back to pending.
const MentorStatusToggle = ({
  mentorId,
  status,
  hasAvailabilitySlots,
}: {
  mentorId: number;
  status: MentorStatus | null;
  hasAvailabilitySlots: boolean;
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = status === "active";
  const targetStatus: "active" | "inactive" = isActive ? "inactive" : "active";
  const blockedFromActivating = !isActive && !hasAvailabilitySlots;

  const handleToggle = async () => {
    setSubmitting(true);
    setError(null);

    const response = await updateMentorStatusAction(mentorId, targetStatus);

    if (response.error) {
      setError(response.message ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={submitting || blockedFromActivating}
        title={
          blockedFromActivating
            ? "Add at least one available time slot before setting this mentor Active"
            : undefined
        }
        className={`px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-green-500 text-white hover:bg-green-600"
        }`}
      >
        {submitting
          ? "Updating..."
          : isActive
          ? "Set Inactive"
          : "Set Active"}
      </button>
      {blockedFromActivating && (
        <span className="text-[11px] text-gray-400">
          Requires at least one available time slot
        </span>
      )}
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
};

export default MentorStatusToggle;
