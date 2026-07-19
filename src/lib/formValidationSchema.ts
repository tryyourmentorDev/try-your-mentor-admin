import { z } from "zod";
import { MENTOR_STATUSES, MentorStatus, MENTOR_TYPES, MentorType } from "./settings";

const MENTOR_STATUS_VALUES = MENTOR_STATUSES.map((s) => s.value) as [
  MentorStatus,
  ...MentorStatus[]
];

const MENTOR_TYPE_VALUES = MENTOR_TYPES.map((t) => t.value) as [
  MentorType,
  ...MentorType[]
];

// Numeric <select>/<input> fields arrive from the form as strings; this
// coerces empty string -> undefined (optional) and everything else -> number.
const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number().optional()
);

const optionalString = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

export const MentorSchema = z.object({
  userId: z.number().optional(), // present only when editing
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: optionalString,
  email: z.string().email({ message: "Invalid email address!" }),
  bio: optionalString,
  status: z.enum(MENTOR_STATUS_VALUES).optional(),
  mentorType: z.enum(MENTOR_TYPE_VALUES).optional(),
  levelOfService: optionalString,
  charge: optionalNumber,
  experienceYears: optionalNumber,
  jobRoleId: optionalNumber,
  highestQualificationId: optionalNumber,
  company: optionalString,
  location: optionalString,
  languages: optionalString,
});

export type MentorFormValues = z.infer<typeof MentorSchema>;
