import { getMentorAction } from "@/actions/mentor";
import { getJobRoleListAction } from "@/actions/jobRole";
import { getQualificationListAction } from "@/actions/qualification";
import { getIndustryListAction } from "@/actions/industry";
import { getWeeklyScheduleAction } from "@/actions/weeklySchedule";
import { getAvailabilitySlotsAction } from "@/actions/availabilitySlot";
import AvailabilityManager from "@/components/AvailabilityManager";
import FormModel from "@/components/FromModel";
import MentorStatusBadge from "@/components/MentorStatusBadge";
import MentorStatusToggle from "@/components/MentorStatusToggle";
import { MentorAvailabilityProvider } from "@/context/MentorAvailabilityContext";
import { role } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";

const MentorDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const mentorId = Number(id);
  const [
    response,
    jobRolesResponse,
    qualificationsResponse,
    industriesResponse,
    weeklyResponse,
    slotsResponse,
  ] = await Promise.all([
    getMentorAction(id),
    getJobRoleListAction(),
    getQualificationListAction(),
    getIndustryListAction(),
    getWeeklyScheduleAction(mentorId),
    getAvailabilitySlotsAction(mentorId),
  ]);

  if (response.error) {
    if (response.message === "Mentor not found") {
      notFound();
    }
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <p className="text-red-600 text-sm">
          Failed to load mentor: {response.message}
        </p>
      </div>
    );
  }

  const mentor = response.data!;
  const jobRoles = jobRolesResponse.data ?? [];
  const qualifications = qualificationsResponse.data ?? [];
  const industries = industriesResponse.data ?? [];
  const weeklySchedule = weeklyResponse.data ?? [];
  const availabilitySlots = slotsResponse.data ?? [];
  const fullName =
    [mentor.firstName, mentor.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col">
      <div className="w-full">
        <MentorAvailabilityProvider
          initialHasActiveSlots={availabilitySlots.some((s) => s.isActive)}
        >
          <div className="bg-white p-4 rounded-md flex gap-4">
            <div className="w-1/3">
              <Image
                src={mentor.profileImageUrl || "/avatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col gap-4 justify-between">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">{fullName}</h1>
                {role === "admin" && (
                  <FormModel
                    table="mentor"
                    type="update"
                    data={mentor}
                    id={mentor.userId}
                    jobRoles={jobRoles}
                    qualifications={qualifications}
                    industries={industries}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">{mentor.bio ?? "—"}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <span className="w-full md:w-1/2 lg:w-full 2xl:w-1/2">
                  {mentor.email}
                </span>
                <span className="w-full md:w-1/2 lg:w-full 2xl:w-1/2 flex items-center gap-2">
                  Status: <MentorStatusBadge status={mentor.status} />
                  {role === "admin" && (
                    <MentorStatusToggle
                      mentorId={mentor.userId}
                      status={mentor.status}
                    />
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white p-4 rounded-md grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Job Role</span>
              <span className="text-sm font-medium">
                {mentor.jobRole ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Highest Qualification</span>
              <span className="text-sm font-medium">
                {mentor.highestQualification ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Experience</span>
              <span className="text-sm font-medium">
                {mentor.experienceYears != null
                  ? `${mentor.experienceYears} years`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Level of Service</span>
              <span className="text-sm font-medium">
                {mentor.levelOfService ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Rating</span>
              <span className="text-sm font-medium">
                {mentor.rating ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Charge</span>
              <span className="text-sm font-medium">
                {mentor.charge != null ? mentor.charge.toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Mentor Type</span>
              <span className="text-sm font-medium">
                {mentor.mentorType ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Company</span>
              <span className="text-sm font-medium">
                {mentor.company ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Location</span>
              <span className="text-sm font-medium">
                {mentor.location ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Languages</span>
              <span className="text-sm font-medium">
                {mentor.languages ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Joined</span>
              <span className="text-sm font-medium">
                {new Date(mentor.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col gap-1 col-span-2 md:col-span-4">
              <span className="text-xs text-gray-400">Expertise</span>
              <span className="text-sm font-medium">
                {mentor.expertises.length > 0
                  ? mentor.expertises.map((e) => e.name).join(", ")
                  : "—"}
              </span>
            </div>
          </div>

          {role === "admin" && (
            <AvailabilityManager
              mentorId={mentor.userId}
              initialWeekly={weeklySchedule}
              initialSlots={availabilitySlots}
            />
          )}
        </MentorAvailabilityProvider>
      </div>
    </div>
  );
};

export default MentorDetailPage;
