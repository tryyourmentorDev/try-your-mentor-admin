"use server";

import { APIResponse } from "@/constants/common";
import { Expertise } from "@/entities/mentor-entity";
import { http } from "@/utils/api";

// Scoped to one industry when industryId is given (used by the Mentor
// form's expertise checklist); a flat list otherwise.
export async function getExpertiseListAction(
  industryId?: number
): Promise<APIResponse<Expertise[]>> {
  const response = await http({
    url: "/expertises",
    method: "GET",
    ...(industryId ? { params: { industry_id: String(industryId) } } : {}),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map((expertise: any) => ({
      id: expertise.id,
      name: expertise.name,
    })),
  };
}
