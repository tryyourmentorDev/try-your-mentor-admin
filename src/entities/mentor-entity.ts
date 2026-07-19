import { MentorStatus, MentorType } from "@/lib/settings";

export interface Mentor {
  userId: number;
  email: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  rating: number | null;
  status: MentorStatus | null;
  mentorType: MentorType | null;
  levelOfService: string | null;
  charge: number | null;
  experienceYears: number | null;
  jobRoleId: number | null;
  jobRole: string | null;
  highestQualificationId: number | null;
  highestQualification: string | null;
  company: string | null;
  profileImageUrl: string | null;
  location: string | null;
  languages: string | null;
  createdAt: string;
}

// Fields the create/update mentor form submits. IDs (job role, qualification)
// are passed as numbers, not names — the BFF resolves the FK from the id.
export interface MentorFormInput {
  firstName: string;
  lastName?: string;
  email: string;
  bio?: string;
  status?: MentorStatus;
  mentorType?: MentorType;
  levelOfService?: string;
  charge?: number;
  experienceYears?: number;
  jobRoleId?: number;
  highestQualificationId?: number;
  company?: string;
  location?: string;
  languages?: string;
}
