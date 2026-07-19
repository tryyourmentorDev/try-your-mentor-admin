"use server";

import { APIResponse } from "@/constants/common";
import { Mentor, MentorFormInput } from "@/entities/mentor-entity";
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
    jobRoleId: mentor.job_role_id,
    jobRole: mentor.job_role,
    highestQualificationId: mentor.highest_qualification_id,
    highestQualification: mentor.highest_qualification,
    company: mentor.company,
    profileImageUrl: mentor.profile_image_url,
    location: mentor.location,
    languages: mentor.languages,
    createdAt: mentor.created_at,
  };
}

// MentorFormInput (camelCase) -> the snake_case body the BFF expects.
function toMentorRequestBody(input: MentorFormInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName || undefined,
    email: input.email,
    bio: input.bio || undefined,
    status: input.status || undefined,
    mentor_type: input.mentorType || undefined,
    level_of_service: input.levelOfService || undefined,
    charge: input.charge ?? undefined,
    experience_years: input.experienceYears ?? undefined,
    job_role_id: input.jobRoleId ?? undefined,
    highest_qualification_id: input.highestQualificationId ?? undefined,
    company: input.company || undefined,
    location: input.location || undefined,
    languages: input.languages || undefined,
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

export async function createMentorAction(
  input: MentorFormInput
): Promise<APIResponse<Mentor>> {
  const response = await http({
    url: "/mentors",
    method: "POST",
    body: toMentorRequestBody(input),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentor(response.data),
  };
}

export async function updateMentorAction(
  userId: number,
  input: MentorFormInput
): Promise<APIResponse<Mentor>> {
  const response = await http({
    url: `/mentors/${userId}`,
    method: "PUT",
    body: toMentorRequestBody(input),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentor(response.data),
  };
}

// Soft delete: the BFF sets status -> 'inactive' rather than removing the
// mentor's row, so historical bookings/reviews/sessions stay intact.
export async function deleteMentorAction(
  userId: number
): Promise<APIResponse<{ user_id: number; status: string }>> {
  const response = await http({
    url: `/mentors/${userId}`,
    method: "DELETE",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data,
  };
}
