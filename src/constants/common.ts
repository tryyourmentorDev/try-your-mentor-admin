export interface ApiRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  auth?: boolean;
  params?: Record<string, string>;
  body?: object;
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://try-your-mentor-bff.onrender.com";

export interface APIResponse<T = void> {
  error: boolean;
  message?: string;
  data?: T;
}
