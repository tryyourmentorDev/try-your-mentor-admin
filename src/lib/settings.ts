export const ITEM_PER_PAGE = 10;

// Mirrors the mentor_status enum in the database (mentors.status).
export const MENTOR_STATUSES = [
  { value: "approval_pending", label: "Approval Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export type MentorStatus = (typeof MENTOR_STATUSES)[number]["value"];

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/mentor(.*)": ["admin"],
  "/mentee(.*)": ["admin"],
  "/list/mentors": ["admin"],
  "/list/mentees": ["admin"],
};
