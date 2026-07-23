import { Suspense } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import SelectFilter from "@/components/SelectFilter";
import SessionStatusBadge from "@/components/SessionStatusBadge";
import Table from "@/components/Table";
import MenteeProfileModal from "@/components/MenteeProfileModal";
import { getBookingListAction } from "@/actions/booking";
import { getMentorListAction } from "@/actions/mentor";
import { Booking } from "@/entities/booking-entity";
import { SessionStatus } from "@/lib/settings";

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

const BOOKING_STATUS_STYLES: Record<string, string> = {
  reserved: "bg-blue-100 text-blue-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-gray-200 text-gray-600",
};

const EMAIL_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const columns = [
  { header: "Mentee", accessor: "mentee" },
  { header: "Mentor", accessor: "mentor", className: "hidden md:table-cell" },
  { header: "When (IST)", accessor: "when", className: "hidden md:table-cell" },
  { header: "Booking", accessor: "status" },
  { header: "Session", accessor: "session", className: "hidden lg:table-cell" },
  { header: "Contacted", accessor: "contacted", className: "hidden lg:table-cell" },
  { header: "Confirmation Email", accessor: "email", className: "hidden lg:table-cell" },
  { header: "Details", accessor: "details" },
];

const renderRow = (item: Booking) => (
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
    <td className="hidden md:table-cell">{formatIst(item.startTime)}</td>
    <td>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          BOOKING_STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-600"
        }`}
      >
        {item.status}
      </span>
    </td>
    <td className="hidden lg:table-cell">
      {item.sessionStatus ? (
        <SessionStatusBadge status={item.sessionStatus as SessionStatus} />
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>
    <td className="hidden lg:table-cell">
      {item.contacted ? (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Contacted
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          Not contacted
        </span>
      )}
    </td>
    <td className="hidden lg:table-cell">
      {item.bookingConfirmationEmailStatus ? (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            EMAIL_STATUS_STYLES[item.bookingConfirmationEmailStatus] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {item.bookingConfirmationEmailStatus}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>
    <td>
      <MenteeProfileModal
        menteeSnapshot={item.menteeSnapshot}
        menteeName={item.menteeName}
        menteeEmail={item.menteeEmail}
      />
    </td>
  </tr>
);

const BookingsTable = async ({
  status,
  mentorId,
}: {
  status?: string;
  mentorId?: string;
}) => {
  const response = await getBookingListAction({
    status,
    mentorId: mentorId ? Number(mentorId) : undefined,
  });

  if (response.error) {
    return (
      <p className="text-red-600 text-sm mt-4">
        Failed to load bookings: {response.message}
      </p>
    );
  }

  const bookings = response.data ?? [];
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-4">No bookings match the current filters.</p>
    );
  }

  return <Table columns={columns} renderRow={renderRow} data={bookings} />;
};

const BookingsListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mentor_id?: string }>;
}) => {
  const { status, mentor_id } = await searchParams;

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
        <h1 className="hidden md:block text-lg font-semibold">All Bookings</h1>
        <div className="flex items-center gap-4 self-end flex-wrap">
          <SelectFilter paramKey="mentor_id" label="All mentors" options={mentorOptions} />
          <SelectFilter
            paramKey="status"
            label="All statuses"
            options={[
              { value: "reserved", label: "Reserved" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </div>
      {/* LIST */}
      <Suspense key={`${status ?? ""}:${mentor_id ?? ""}`} fallback={<LoadingOverlay />}>
        <BookingsTable status={status} mentorId={mentor_id} />
      </Suspense>
    </div>
  );
};

export default BookingsListPage;
