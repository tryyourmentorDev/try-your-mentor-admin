import { MentorStatus } from "@/lib/settings";

export interface Mentor {
  userId: number;
  email: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  rating: number | null;
  status: MentorStatus | null;
  mentorType: string | null;
  levelOfService: string | null;
  charge: number | null;
  experienceYears: number | null;
  jobRole: string | null;
  highestQualification: string | null;
  createdAt: string;
}
