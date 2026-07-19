"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MenteeSchema,
  MenteeFormValues,
} from "../../lib/formValidationSchema";
import { createMenteeAction, updateMenteeAction } from "../../actions/mentee";
import { Mentee } from "../../entities/mentee-entity";
import { JobRole } from "../../entities/job-role-entity";
import { Qualification } from "../../entities/qualification-entity";
import InputField from "../InputField";

const MenteeForm = ({
  type,
  data,
  jobRoles,
  qualifications,
  onSuccess,
}: {
  type: "create" | "update";
  data?: Mentee;
  jobRoles: JobRole[];
  qualifications: Qualification[];
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MenteeFormValues>({
    resolver: zodResolver(MenteeSchema),
    defaultValues: {
      userId: data?.userId,
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      email: data?.email ?? "",
      educationQualificationId: data?.educationQualificationId ?? undefined,
      currentJobRoleId: data?.currentJobRoleId ?? undefined,
      expectedJobRoleId: data?.expectedJobRoleId ?? undefined,
      experienceYears: data?.experienceYears ?? undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const response =
      type === "create"
        ? await createMenteeAction(values)
        : await updateMenteeAction(data!.userId, values);

    if (response.error) {
      setSubmitError(response.message ?? "Something went wrong");
      return;
    }

    router.refresh();
    onSuccess?.();
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new mentee" : "Update the mentee"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors?.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName ?? ""}
          register={register}
          error={errors?.lastName}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Mentee Profile
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Education Qualification
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("educationQualificationId")}
            defaultValue={data?.educationQualificationId ?? ""}
          >
            <option value="">Select a qualification</option>
            {qualifications.map((qualification) => (
              <option key={qualification.id} value={qualification.id}>
                {qualification.name}
              </option>
            ))}
          </select>
          {errors.educationQualificationId?.message && (
            <p className="text-xs text-red-400">
              {errors.educationQualificationId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Current Job Role</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("currentJobRoleId")}
            defaultValue={data?.currentJobRoleId ?? ""}
          >
            <option value="">Select a job role</option>
            {jobRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.currentJobRoleId?.message && (
            <p className="text-xs text-red-400">
              {errors.currentJobRoleId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Expected Job Role</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("expectedJobRoleId")}
            defaultValue={data?.expectedJobRoleId ?? ""}
          >
            <option value="">Select a job role</option>
            {jobRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.expectedJobRoleId?.message && (
            <p className="text-xs text-red-400">
              {errors.expectedJobRoleId.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Experience (years)"
          name="experienceYears"
          type="number"
          defaultValue={
            data?.experienceYears != null ? String(data.experienceYears) : ""
          }
          register={register}
          error={errors?.experienceYears}
          inputProps={{ min: 0 }}
        />
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MenteeForm;
