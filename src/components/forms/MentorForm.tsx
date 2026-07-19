"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  MentorSchema,
  MentorFormValues,
} from "../../lib/formValidationSchema";
import { MENTOR_TYPES } from "../../lib/settings";
import { createMentorAction, updateMentorAction } from "../../actions/mentor";
import { Mentor } from "../../entities/mentor-entity";
import { JobRole } from "../../entities/job-role-entity";
import { Qualification } from "../../entities/qualification-entity";
import InputField from "../InputField";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const MentorForm = ({
  type,
  data,
  jobRoles,
  qualifications,
  onSuccess,
}: {
  type: "create" | "update";
  data?: Mentor;
  jobRoles: JobRole[];
  qualifications: Qualification[];
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data?.profileImageUrl ?? null
  );
  const [profileImage, setProfileImage] = useState<
    { fileName: string; mimeType: string; base64: string } | undefined
  >(undefined);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Please choose a JPEG, PNG, or WEBP image");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image must be 5MB or smaller");
      e.target.value = "";
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setPreviewUrl(dataUrl);
    setProfileImage({ fileName: file.name, mimeType: file.type, base64: dataUrl });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MentorFormValues>({
    resolver: zodResolver(MentorSchema),
    defaultValues: {
      userId: data?.userId,
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      email: data?.email ?? "",
      bio: data?.bio ?? "",
      mentorType: data?.mentorType ?? "All",
      levelOfService: data?.levelOfService ?? "",
      charge: data?.charge ?? undefined,
      experienceYears: data?.experienceYears ?? undefined,
      jobRoleId: data?.jobRoleId ?? undefined,
      highestQualificationId: data?.highestQualificationId ?? undefined,
      company: data?.company ?? "",
      location: data?.location ?? "",
      languages: data?.languages ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const payload = { ...values, profileImage };

    const response =
      type === "create"
        ? await createMentorAction(payload)
        : await updateMentorAction(data!.userId, payload);

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
        {type === "create" ? "Create a new mentor" : "Update the mentor"}
      </h1>
      {type === "create" && (
        <p className="text-xs text-gray-400 -mt-6">
          New mentors start out as &ldquo;Approval Pending&rdquo;. Activate them
          from the mentor profile page once their available time slots are set up.
        </p>
      )}

      <span className="text-xs text-gray-400 font-medium">
        Profile Picture
      </span>
      <div className="flex items-center gap-4">
        <Image
          src={previewUrl || "/noAvatar.png"}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover ring-1 ring-gray-200"
        />
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="text-sm"
          />
          {imageError && <p className="text-xs text-red-400">{imageError}</p>}
        </div>
      </div>

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
        <InputField
          label="Company"
          name="company"
          defaultValue={data?.company ?? ""}
          register={register}
          error={errors?.company}
        />
        <InputField
          label="Location"
          name="location"
          defaultValue={data?.location ?? ""}
          register={register}
          error={errors?.location}
        />
        <InputField
          label="Languages"
          name="languages"
          defaultValue={data?.languages ?? ""}
          register={register}
          error={errors?.languages}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Mentor Profile
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Job Role</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("jobRoleId")}
            defaultValue={data?.jobRoleId ?? ""}
          >
            <option value="">Select a job role</option>
            {jobRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.jobRoleId?.message && (
            <p className="text-xs text-red-400">
              {errors.jobRoleId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Highest Qualification
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("highestQualificationId")}
            defaultValue={data?.highestQualificationId ?? ""}
          >
            <option value="">Select a qualification</option>
            {qualifications.map((qualification) => (
              <option key={qualification.id} value={qualification.id}>
                {qualification.name}
              </option>
            ))}
          </select>
          {errors.highestQualificationId?.message && (
            <p className="text-xs text-red-400">
              {errors.highestQualificationId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Mentor Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("mentorType")}
            defaultValue={data?.mentorType ?? "All"}
          >
            {MENTOR_TYPES.map((mentorType) => (
              <option key={mentorType.value} value={mentorType.value}>
                {mentorType.label}
              </option>
            ))}
          </select>
          {errors.mentorType?.message && (
            <p className="text-xs text-red-400">
              {errors.mentorType.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Level of Service"
          name="levelOfService"
          defaultValue={data?.levelOfService ?? ""}
          register={register}
          error={errors?.levelOfService}
        />
        <InputField
          label="Charge"
          name="charge"
          type="number"
          defaultValue={data?.charge != null ? String(data.charge) : ""}
          register={register}
          error={errors?.charge}
          inputProps={{ step: "0.01", min: 0 }}
        />
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

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Bio</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            rows={3}
            {...register("bio")}
            defaultValue={data?.bio ?? ""}
          />
          {errors.bio?.message && (
            <p className="text-xs text-red-400">
              {errors.bio.message.toString()}
            </p>
          )}
        </div>
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

export default MentorForm;
