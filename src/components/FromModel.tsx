"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MentorForm from "./forms/MentorForm";
import MenteeForm from "./forms/MenteeForm";
import SessionForm from "./forms/SessionForm";
import { deleteMentorAction } from "../actions/mentor";
import { deleteMenteeAction } from "../actions/mentee";
import { deleteSessionAction } from "../actions/session";
import { Mentor } from "../entities/mentor-entity";
import { Mentee } from "../entities/mentee-entity";
import { Session } from "../entities/session-entity";
import { JobRole } from "../entities/job-role-entity";
import { Qualification } from "../entities/qualification-entity";

const HARD_DELETE_TABLES = ["mentee", "session"] as const;

const FormModel = ({
  table,
  type,
  data,
  id,
  jobRoles = [],
  qualifications = [],
  mentors = [],
}: {
  table: "mentor" | "mentee" | "session";
  type: "create" | "update" | "delete";
  data?: Mentor | Mentee | Session;
  id?: number | string;
  jobRoles?: JobRole[];
  qualifications?: Qualification[];
  mentors?: Mentor[];
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setDeleting(true);
    setDeleteError(null);

    const response =
      table === "mentor"
        ? await deleteMentorAction(Number(id))
        : table === "mentee"
        ? await deleteMenteeAction(Number(id))
        : await deleteSessionAction(Number(id));

    if (response.error) {
      setDeleteError(response.message ?? "Something went wrong");
      setDeleting(false);
      return;
    }

    router.refresh();
    setOpen(false);
    setDeleting(false);
  };

  const renderForm = () => {
    if (type === "delete" && id) {
      // Mentor delete is a soft-deactivate; mentee/session delete are hard.
      const isSoft = !HARD_DELETE_TABLES.includes(
        table as (typeof HARD_DELETE_TABLES)[number]
      );
      return (
        <form onSubmit={handleDelete} className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            {isSoft
              ? `This will mark the ${table} as inactive. Their history (bookings, sessions, reviews) is kept — this does not permanently delete data. Continue?`
              : `This will permanently delete this ${table}. Continue?`}
          </span>
          {deleteError && (
            <p className="text-sm text-red-500 text-center">{deleteError}</p>
          )}
          <button
            type="submit"
            disabled={deleting}
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center disabled:opacity-60"
          >
            {deleting
              ? isSoft
                ? "Deactivating..."
                : "Deleting..."
              : isSoft
              ? "Deactivate"
              : "Delete"}
          </button>
        </form>
      );
    }

    if (table === "mentor" && (type === "create" || type === "update")) {
      return (
        <MentorForm
          type={type}
          data={data as Mentor}
          jobRoles={jobRoles}
          qualifications={qualifications}
          onSuccess={() => setOpen(false)}
        />
      );
    }

    if (table === "mentee" && (type === "create" || type === "update")) {
      return (
        <MenteeForm
          type={type}
          data={data as Mentee}
          jobRoles={jobRoles}
          qualifications={qualifications}
          onSuccess={() => setOpen(false)}
        />
      );
    }

    if (table === "session" && (type === "create" || type === "update")) {
      return (
        <SessionForm
          type={type}
          data={data as Session}
          mentors={mentors}
          onSuccess={() => setOpen(false)}
        />
      );
    }

    return null;
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </button>
            {renderForm()}
          </div>
        </div>
      )}
    </>
  );
};

export default FormModel;
