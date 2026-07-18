"use server";

import { auth } from "@clerk/nextjs/server";
import { API_URL, ApiRequest } from "@/constants/common";

export const http = async ({ url, method, params, body }: ApiRequest) => {
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

  const responseData = await response.json();

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
};
