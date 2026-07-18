import { APIResponse } from "@/constants/common";
import { Mentor } from "@/entities/mentor-entity";
import { http } from "@/utils/api";

export async function getMentorListAction(): Promise<APIResponse<Mentor[]>> {
  const response = await http({
    url: "/mentors",
    method: "GET",
  });

  if (response.error) {
    return response;
  }
  const data = response.data;

  return {
    error: false,
    data: data.map((mentor: any) => ({
      userId: mentor.user_id,
      bio: mentor.bio,
      rating: mentor.rating,
      status: mentor.status,
      mentorType: mentor.mentor_type,
      levelOfService: mentor.level_of_service,
      charge: mentor.charge,
      createdAt: mentor.created_at,
    })),
  };
}
