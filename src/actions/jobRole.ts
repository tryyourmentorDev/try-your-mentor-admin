import { APIResponse } from "@/constants/common";
import { JobRole } from "@/entities/job-role-entity";
import { http } from "@/utils/api";

export async function getJobRoleListAction(): Promise<APIResponse<JobRole[]>> {
  const response = await http({
    url: "/job-roles",
    method: "GET",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map((role: any) => ({
      id: role.id,
      name: role.name,
      rank: role.rank ?? null,
    })),
  };
}
