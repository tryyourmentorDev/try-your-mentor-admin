"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MentorForm from "./forms/MentorForm";
import SessionForm from "./forms/SessionForm";
import { deleteMentorAction } from "../actions/mentor";
import { deleteSessionAction } from "../actions/session";
import { Mentor } from "../entities/mentor-entity";
import { Session } from "../entities/session-entity";
import { JobRole } from "../entities/job-role-entity";
import { Qualification } from "../entities/qualification-entity";

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
  data?: Mentor | Session;
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
    if (!id || (table !== "mentor" && table !== "session")) return;

    setDeleting(true);
    setDeleteError(null);

    const response =
      table === "mentor"
        ? await deleteMentorAction(Number(id))
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
      // Mentor delete is a soft-deactivate; session delete is a hard delete.
      const isSoft = table === "mentor";
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
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            {renderForm()}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModel;
