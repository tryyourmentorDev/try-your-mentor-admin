"use server";

import { APIResponse } from "@/constants/common";
import { http } from "@/utils/api";

export interface Industry {
  id: number;
  name: string;
}

export async function getIndustryListAction(): Promise<APIResponse<Industry[]>> {
  const response = await http({
    url: "/industries",
    method: "GET",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map((industry: any) => ({
      id: industry.id,
      name: industry.name,
    })),
  };
}
