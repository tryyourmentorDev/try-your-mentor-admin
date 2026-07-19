import { Suspense } from "react";
import FormModel from "@/components/FromModel";
import LoadingOverlay from "@/components/LoadingOverlay";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getMenteeListAction } from "@/actions/mentee";
import { getJobRoleListAction } from "@/actions/jobRole";
import { getQualificationListAction } from "@/actions/qualification";
import { Mentee } from "@/entities/mentee-entity";
import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Education",
    accessor: "education",
    className: "hidden md:table-cell",
  },
  {
    header: "Current Job Role",
    accessor: "currentJobRole",
    className: "hidden md:table-cell",
  },
  {
    header: "Experience",
    accessor: "experience",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: Mentee) => (
  <tr
    key={item.userId}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <Image
        src="/noAvatar.png"
        alt=""
        width={40}
        height={40}
        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">
          {[item.firstName, item.lastName].filter(Boolean).join(" ") || "—"}
        </h3>
        <p className="text-xs text-gray-500">{item.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.educationQualification ?? "—"}
    </td>
    <td className="hidden md:table-cell">{item.currentJobRole ?? "—"}</td>
    <td className="hidden lg:table-cell">
      {item.experienceYears != null ? `${item.experienceYears} years` : "—"}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/mentees/${item.userId}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "admin" && (
          <FormModel table="mentee" type="delete" id={item.userId} />
        )}
      </div>
    </td>
  </tr>
);

// Fetches and renders the mentee rows on their own — isolated in a Suspense
// boundary so it (and the overlay) can reload without unmounting the search
// box above it.
const MenteeTable = async ({ search }: { search?: string }) => {
  const response = await getMenteeListAction({ search });

  if (response.error) {
    return (
      <p className="text-red-600 text-sm mt-4">
        Failed to load mentees: {response.message}
      </p>
    );
  }

  const mentees = response.data ?? [];

  if (mentees.length === 0 && search) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        No mentees match the current filters.
      </p>
    );
  }

  return <Table columns={columns} renderRow={renderRow} data={mentees} />;
};

const MenteeListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) => {
  const { search } = await searchParams;

  const [jobRolesResponse, qualificationsResponse] = await Promise.all([
    getJobRoleListAction(),
    getQualificationListAction(),
  ]);
  const jobRoles = jobRolesResponse.data ?? [];
  const qualifications = qualificationsResponse.data ?? [];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Mentees</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch placeholder="Search by name or email..." />
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormModel
                table="mentee"
                type="create"
                jobRoles={jobRoles}
                qualifications={qualifications}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Suspense key={search ?? ""} fallback={<LoadingOverlay />}>
        <MenteeTable search={search} />
      </Suspense>
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default MenteeListPage;
