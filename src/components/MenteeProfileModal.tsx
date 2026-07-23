"use client";

import { useState } from "react";
import { MenteeSnapshot } from "@/entities/booking-entity";

// A "Details" button that opens a modal showing the mentee's onboarding profile
// snapshot (expertise, goals, education, experience, job role) captured at
// booking time. Shared by the Bookings and Sessions tables. A null snapshot
// (older bookings / manually-created sessions) renders an empty state.
const Field = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium">{value || "—"}</span>
  </div>
);

const MenteeProfileModal = ({
  menteeSnapshot,
  menteeName,
  menteeEmail,
}: {
  menteeSnapshot: MenteeSnapshot | null;
  menteeName: string | null;
  menteeEmail: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const goals = menteeSnapshot?.goals ?? [];

  return (
    <>
      <button
        type="button"
        className="px-3 py-1 rounded-full text-xs font-medium bg-lamaPurpleLight text-purple-700 hover:bg-purple-100 transition-colors whitespace-nowrap"
        onClick={() => setOpen(true)}
      >
        Details
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold">Mentee Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              {menteeName ?? "—"}
              {menteeEmail ? ` · ${menteeEmail}` : ""}
            </p>

            {menteeSnapshot ? (
              <div className="mt-5 flex flex-col gap-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Expertise" value={menteeSnapshot.expertise} />
                  <Field
                    label="Education Level"
                    value={menteeSnapshot.educationLevel}
                  />
                  <Field
                    label="Experience Level"
                    value={menteeSnapshot.experienceLevel}
                  />
                  <Field label="Current Job Role" value={menteeSnapshot.jobRole} />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-400">Goals</span>
                  {goals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {goals.map((goal) => (
                        <span
                          key={goal}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-medium">—</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500">
                No profile was captured for this booking.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MenteeProfileModal;
