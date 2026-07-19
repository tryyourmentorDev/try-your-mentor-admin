import { APIResponse } from "@/constants/common";
import { Qualification } from "@/entities/qualification-entity";
import { http } from "@/utils/api";

export async function getQualificationListAction(): Promise<
  APIResponse<Qualification[]>
> {
  const response = await http({
    url: "/qualifications",
    method: "GET",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map((qualification: any) => ({
      id: qualification.id,
      name: qualification.name,
      rank: qualification.rank ?? null,
    })),
  };
}
