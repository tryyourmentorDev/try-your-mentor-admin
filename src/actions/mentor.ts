import { APIResponse } from "@/constants/common";
import { Mentor } from "@/entities/mentor-entity";
import { http } from "@/utils/api";

function mapMentor(mentor: any): Mentor {
  return {
    userId: mentor.user_id,
    email: mentor.email,
    firstName: mentor.first_name,
    lastName: mentor.last_name,
    bio: mentor.bio,
    rating: mentor.rating === null ? null : Number(mentor.rating),
    status: mentor.status,
    mentorType: mentor.mentor_type,
    levelOfService: mentor.level_of_service,
    charge: mentor.charge === null ? null : Number(mentor.charge),
    experienceYears: mentor.experience_years,
    jobRole: mentor.job_role,
    highestQualification: mentor.highest_qualification,
    createdAt: mentor.created_at,
  };
}

export async function getMentorListAction(filters?: {
  search?: string;
  status?: string;
}): Promise<APIResponse<Mentor[]>> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;

  const response = await http({
    url: "/mentors",
    method: "GET",
    ...(Object.keys(params).length ? { params } : {}),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map(mapMentor),
  };
}

export async function getMentorAction(
  userId: string
): Promise<APIResponse<Mentor>> {
  const response = await http({
    url: `/mentors/${userId}`,
    method: "GET",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentor(response.data),
  };
}
