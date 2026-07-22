"use server";

import { auth } from "@clerk/nextjs/server";
import { API_URL, ApiRequest } from "@/constants/common";

export const http = async ({ url, method, params, body }: ApiRequest) => {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      API_URL + url + (params ? "?" + new URLSearchParams(params) : ""),
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }
    );

    // The BFF wraps every response as { success, data } / { success, message }.
    // A non-JSON body (e.g. an HTML 404/502 from hitting the wrong host or a
    // gateway error) would otherwise throw here and bubble up as an opaque
    // "Server Components render" 500. Swallow it into the normal error shape so
    // callers (which all check `response.error`) can show a graceful message.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      return {
        error: true,
        message: `Unexpected ${response.status} response from the server`,
      };
    }

    if (responseData.success) {
      return {
        error: false,
        data: responseData.data,
      };
    } else {
      return {
        error: true,
        message: responseData.message,
      };
    }
  } catch (error) {
    // Network failure, DNS error, aborted request, etc.
    return {
      error: true,
      message:
        error instanceof Error ? error.message : "Failed to reach the server",
    };
  }
};
