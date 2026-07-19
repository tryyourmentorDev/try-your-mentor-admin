import { Suspense } from "react";
import Image from "next/image";
import FormModel from "@/components/FromModel";
import LoadingOverlay from "@/components/LoadingOverlay";
import SelectFilter from "@/components/SelectFilter";
import SessionStatusBadge from "@/components/SessionStatusBadge";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getSessionListAction } from "@/actions/session";
import { getMentorListAction } from "@/actions/mentor";
import { Session } from "@/entities/session-entity";
import { Mentor } from "@/entities/mentor-entity";
import { SESSION_STATUSES } from "@/lib/settings";
import { role } from "@/lib/data";

const IST = "Asia/Kolkata";
const formatIst = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    timeZone: IST,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const columns = [
  { header: "Mentee", accessor: "mentee" },
  { header: "Mentor", accessor: "mentor", className: "hidden md:table-cell" },
  { header: "Scheduled (IST)", accessor: "scheduledAt", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Contacted", accessor: "contacted", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ContactedBadge = ({ contacted }: { contacted: boolean }) =>
  contacted ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Contacted
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      Not contacted
    </span>
  );

const renderRow = (mentors: Mentor[]) => (item: Session) =>
  (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.menteeName ?? "—"}</h3>
          <p className="text-xs text-gray-500">{item.menteeEmail ?? "—"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.mentorName ?? "—"}</td>
      <td className="hidden md:table-cell">{formatIst(item.scheduledAt)}</td>
      <td>
        <SessionStatusBadge status={item.status} />
      </td>
      <td className="hidden lg:table-cell">
        <ContactedBadge contacted={item.contacted} />
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModel table="session" type="update" data={item} id={item.id} mentors={mentors} />
              <FormModel table="session" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

const SessionsTable = async ({
  search,
  status,
  contacted,
  mentorId,
  mentors,
}: {
  search?: string;
  status?: string;
  contacted?: string;
  mentorId?: string;
  mentors: Mentor[];
}) => {
  const response = await getSessionListAction({
    search,
    status,
    contacted: contacted === "true" ? true : contacted === "false" ? false : undefined,
    mentorId: mentorId ? Number(mentorId) : undefined,
  });

  if (response.error) {
    return (
      <p className="text-red-600 text-sm mt-4">
        Failed to load sessions: {response.message}
      </p>
    );
  }

  const sessions = response.data ?? [];
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-4">No sessions match the current filters.</p>
    );
  }

  return <Table columns={columns} renderRow={renderRow(mentors)} data={sessions} />;
};

const SessionListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    contacted?: string;
    mentor_id?: string;
  }>;
}) => {
  const { search, status, contacted, mentor_id } = await searchParams;

  const mentorsResponse = await getMentorListAction();
  const mentors = mentorsResponse.data ?? [];
  const mentorOptions = mentors.map((m) => ({
    value: String(m.userId),
    label: [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Sessions</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch placeholder="Search by mentee or mentor..." />
          <div className="flex items-center gap-4 self-end flex-wrap">
            <SelectFilter paramKey="mentor_id" label="All mentors" options={mentorOptions} />
            <SelectFilter paramKey="status" label="All statuses" options={[...SESSION_STATUSES]} />
            <SelectFilter
              paramKey="contacted"
              label="Contacted?"
              options={[
                { value: "true", label: "Contacted" },
                { value: "false", label: "Not contacted" },
              ]}
            />
            {role === "admin" && (
              <FormModel table="session" type="create" mentors={mentors} />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Suspense
        key={`${search ?? ""}:${status ?? ""}:${contacted ?? ""}:${mentor_id ?? ""}`}
        fallback={<LoadingOverlay />}
      >
        <SessionsTable
          search={search}
          status={status}
          contacted={contacted}
          mentorId={mentor_id}
          mentors={mentors}
        />
      </Suspense>
    </div>
  );
};

export default SessionListPage;
