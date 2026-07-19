export interface Mentee {
  userId: number;
  email: string;
  firstName: string;
  lastName: string | null;
  educationQualificationId: number | null;
  educationQualification: string | null;
  currentJobRoleId: number | null;
  currentJobRole: string | null;
  expectedJobRoleId: number | null;
  expectedJobRole: string | null;
  experienceYears: number | null;
  createdAt: string;
}

// Fields the create/update mentee form submits. IDs (job role, qualification)
// are passed as numbers, not names — the BFF resolves the FK from the id.
export interface MenteeFormInput {
  firstName: string;
  lastName?: string;
  email: string;
  educationQualificationId?: number;
  currentJobRoleId?: number;
  expectedJobRoleId?: number;
  experienceYears?: number;
}
