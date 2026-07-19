"use server";

import { APIResponse } from "@/constants/common";
import { Mentee, MenteeFormInput } from "@/entities/mentee-entity";
import { http } from "@/utils/api";

function mapMentee(mentee: any): Mentee {
  return {
    userId: mentee.user_id,
    email: mentee.email,
    firstName: mentee.first_name,
    lastName: mentee.last_name,
    educationQualificationId: mentee.education_qualification_id,
    educationQualification: mentee.education_qualification,
    currentJobRoleId: mentee.current_job_role_id,
    currentJobRole: mentee.current_job_role,
    expectedJobRoleId: mentee.expected_job_role_id,
    expectedJobRole: mentee.expected_job_role,
    experienceYears: mentee.experience_years,
    createdAt: mentee.created_at,
  };
}

function toMenteeRequestBody(input: MenteeFormInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName || undefined,
    email: input.email,
    education_qualification_id: input.educationQualificationId ?? undefined,
    current_job_role_id: input.currentJobRoleId ?? undefined,
    expected_job_role_id: input.expectedJobRoleId ?? undefined,
    experience_years: input.experienceYears ?? undefined,
  };
}

export async function getMenteeListAction(filters?: {
  search?: string;
}): Promise<APIResponse<Mentee[]>> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;

  const response = await http({
    url: "/mentees",
    method: "GET",
    ...(Object.keys(params).length ? { params } : {}),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: response.data.map(mapMentee),
  };
}

export async function getMenteeAction(
  userId: string
): Promise<APIResponse<Mentee>> {
  const response = await http({
    url: `/mentees/${userId}`,
    method: "GET",
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentee(response.data),
  };
}

export async function createMenteeAction(
  input: MenteeFormInput
): Promise<APIResponse<Mentee>> {
  const response = await http({
    url: "/mentees",
    method: "POST",
    body: toMenteeRequestBody(input),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentee(response.data),
  };
}

export async function updateMenteeAction(
  userId: number,
  input: MenteeFormInput
): Promise<APIResponse<Mentee>> {
  const response = await http({
    url: `/mentees/${userId}`,
    method: "PUT",
    body: toMenteeRequestBody(input),
  });

  if (response.error) {
    return response;
  }

  return {
    error: false,
    data: mapMentee(response.data),
  };
}

export async function deleteMenteeAction(
  userId: number
): Promise<APIResponse<{ user_id: number }>> {
  const response = await http({
    url: `/mentees/${userId}`,
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
