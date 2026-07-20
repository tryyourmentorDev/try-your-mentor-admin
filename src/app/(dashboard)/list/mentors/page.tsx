import { Suspense } from "react";
import FormModel from "@/components/FromModel";
import LoadingOverlay from "@/components/LoadingOverlay";
import MentorStatusBadge from "@/components/MentorStatusBadge";
import Pagination from "@/components/Pagination";
import StatusFilter from "@/components/StatusFilter";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getMentorListAction } from "@/actions/mentor";
import { getJobRoleListAction } from "@/actions/jobRole";
import { getQualificationListAction } from "@/actions/qualification";
import { Mentor } from "@/entities/mentor-entity";
import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Job Role",
    accessor: "jobRole",
    className: "hidden md:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Rating",
    accessor: "rating",
    className: "hidden lg:table-cell",
  },
  {
    header: "Charge",
    accessor: "charge",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: Mentor) => (
  <tr
    key={item.userId}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <Image
        src={item.profileImageUrl || "/avatar.png"}
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
    <td className="hidden md:table-cell">{item.jobRole ?? "—"}</td>
    <td className="hidden md:table-cell">
      <MentorStatusBadge status={item.status} />
    </td>
    <td className="hidden lg:table-cell">{item.rating ?? "—"}</td>
    <td className="hidden lg:table-cell">
      {item.charge != null ? item.charge.toLocaleString() : "—"}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/mentors/${item.userId}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16} />
          </button>
        </Link>
        {role === "admin" && (
          <FormModel table="mentor" type="delete" id={item.userId} />
        )}
      </div>
    </td>
  </tr>
);

// Fetches and renders the mentor rows on their own — isolated in a Suspense
// boundary so it (and the overlay) can reload without unmounting the search
// box above it.
const MentorTable = async ({
  search,
  status,
}: {
  search?: string;
  status?: string;
}) => {
  const response = await getMentorListAction({ search, status });

  if (response.error) {
    return (
      <p className="text-red-600 text-sm mt-4">
        Failed to load mentors: {response.message}
      </p>
    );
  }

  const mentors = response.data ?? [];

  if (mentors.length === 0 && (search || status)) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        No mentors match the current filters.
      </p>
    );
  }

  return <Table columns={columns} renderRow={renderRow} data={mentors} />;
};

const MentorListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) => {
  const { search, status } = await searchParams;

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
        <h1 className="hidden md:block text-lg font-semibold">All Mentors</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch placeholder="Search by name or job role..." />
          <div className="flex items-center gap-4 self-end">
            <StatusFilter />
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModel
                table="mentor"
                type="create"
                jobRoles={jobRoles}
                qualifications={qualifications}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Suspense key={`${search ?? ""}:${status ?? ""}`} fallback={<LoadingOverlay />}>
        <MentorTable search={search} status={status} />
      </Suspense>
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default MentorListPage;
