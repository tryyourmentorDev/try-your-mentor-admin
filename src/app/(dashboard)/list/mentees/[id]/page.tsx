import { getMenteeAction } from "@/actions/mentee";
import { getJobRoleListAction } from "@/actions/jobRole";
import { getQualificationListAction } from "@/actions/qualification";
import FormModel from "@/components/FromModel";
import { role } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";

const MenteeDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [response, jobRolesResponse, qualificationsResponse] =
    await Promise.all([
      getMenteeAction(id),
      getJobRoleListAction(),
      getQualificationListAction(),
    ]);

  if (response.error) {
    if (response.message === "Mentee not found") {
      notFound();
    }
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <p className="text-red-600 text-sm">
          Failed to load mentee: {response.message}
        </p>
      </div>
    );
  }

  const mentee = response.data!;
  const jobRoles = jobRolesResponse.data ?? [];
  const qualifications = qualificationsResponse.data ?? [];
  const fullName =
    [mentee.firstName, mentee.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="bg-white p-4 rounded-md flex gap-4">
          <div className="w-1/3">
            <Image
              src="/noAvatar.png"
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
                  table="mentee"
                  type="update"
                  data={mentee}
                  id={mentee.userId}
                  jobRoles={jobRoles}
                  qualifications={qualifications}
                />
              )}
            </div>
            <p className="text-sm text-gray-500">{mentee.email}</p>
          </div>
        </div>

        <div className="mt-4 bg-white p-4 rounded-md grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">
              Education Qualification
            </span>
            <span className="text-sm font-medium">
              {mentee.educationQualification ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Current Job Role</span>
            <span className="text-sm font-medium">
              {mentee.currentJobRole ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Expected Job Role</span>
            <span className="text-sm font-medium">
              {mentee.expectedJobRole ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Experience</span>
            <span className="text-sm font-medium">
              {mentee.experienceYears != null
                ? `${mentee.experienceYears} years`
                : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Joined</span>
            <span className="text-sm font-medium">
              {new Date(mentee.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-4 bg-white p-4 rounded-md">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            CV / Resume
          </h2>
          {mentee.resumes && mentee.resumes.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {mentee.resumes.map((resume) => (
                <li
                  key={resume.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {resume.fileName ?? "Resume"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-blue-500 hover:underline shrink-0"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No CV uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeDetailPage;
