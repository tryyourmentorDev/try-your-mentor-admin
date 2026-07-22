export interface ApiRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  auth?: boolean;
  params?: Record<string, string>;
  body?: object;
}

// The admin dashboard talks only to the admin-BFF (never the public BFF, which
// lacks /dashboard, requireAdmin auth, etc.). Falls back to the deployed
// admin-BFF so a missing env var doesn't silently route to the wrong host.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://try-your-mentor-admin-bff.onrender.com";

export interface APIResponse<T = void> {
  error: boolean;
  message?: string;
  data?: T;
}
