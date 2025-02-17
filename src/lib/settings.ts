export const ITEM_PER_PAGE = 10;

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
