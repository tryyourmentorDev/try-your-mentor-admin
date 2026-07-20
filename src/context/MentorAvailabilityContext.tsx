"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Shares "does this mentor have at least one active availability slot"
// between AvailabilityManager (which owns the slot list and knows the
// instant it changes) and MentorStatusToggle (which needs that boolean to
// enable/disable the Active button) — they're siblings in the mentor detail
// page, not parent/child, so a prop passed down from the server component
// would go stale until a full page reload. This context keeps them in sync
// live, in the same tab, without a refresh.
type MentorAvailabilityContextValue = {
  hasActiveSlots: boolean;
  setHasActiveSlots: (value: boolean) => void;
};

const MentorAvailabilityContext =
  createContext<MentorAvailabilityContextValue | null>(null);

export const MentorAvailabilityProvider = ({
  initialHasActiveSlots,
  children,
}: {
  initialHasActiveSlots: boolean;
  children: ReactNode;
}) => {
  const [hasActiveSlots, setHasActiveSlots] = useState(initialHasActiveSlots);

  return (
    <MentorAvailabilityContext.Provider
      value={{ hasActiveSlots, setHasActiveSlots }}
    >
      {children}
    </MentorAvailabilityContext.Provider>
  );
};

export const useMentorAvailability = () => {
  const ctx = useContext(MentorAvailabilityContext);
  if (!ctx) {
    throw new Error(
      "useMentorAvailability must be used within a MentorAvailabilityProvider"
    );
  }
  return ctx;
};
