"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import Image from "next/image";
import {
  MentorSchema,
  MentorFormValues,
} from "../../lib/formValidationSchema";
import { MENTOR_TYPES } from "../../lib/settings";
import { createMentorAction, updateMentorAction } from "../../actions/mentor";
import { getExpertiseListAction } from "../../actions/expertise";
import { Expertise, Mentor } from "../../entities/mentor-entity";
import { JobRole } from "../../entities/job-role-entity";
import { Qualification } from "../../entities/qualification-entity";
import { Industry } from "../../actions/industry";
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
  industries,
  onSuccess,
}: {
  type: "create" | "update";
  data?: Mentor;
  jobRoles: JobRole[];
  qualifications: Qualification[];
  industries: Industry[];
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const fileInputId = useId();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data?.profileImageUrl ?? null
  );
  const [profileImage, setProfileImage] = useState<
    { fileName: string; mimeType: string; base64: string } | undefined
  >(undefined);

  // Industry is UI-only (mentors has no industry_id column) — it just scopes
  // which expertise checkboxes are offered. Selected expertise ids are kept
  // independent of the currently-browsed industry, so switching industries
  // never drops previously-checked items picked under a different one.
  const [industryId, setIndustryId] = useState<number | undefined>(undefined);
  const [expertiseOptions, setExpertiseOptions] = useState<Expertise[]>([]);
  const [expertiseLoading, setExpertiseLoading] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<Map<number, string>>(
    () => new Map((data?.expertises ?? []).map((e) => [e.id, e.name]))
  );

  useEffect(() => {
    let cancelled = false;
    setExpertiseLoading(true);
    getExpertiseListAction(industryId).then((response) => {
      if (cancelled) return;
      setExpertiseLoading(false);
      if (!response.error) {
        setExpertiseOptions(response.data ?? []);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [industryId]);

  const toggleExpertise = (expertise: Expertise) => {
    setSelectedExpertise((prev) => {
      const next = new Map(prev);
      if (next.has(expertise.id)) {
        next.delete(expertise.id);
      } else {
        next.set(expertise.id, expertise.name);
      }
      return next;
    });
  };

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
      linkedinUrl: data?.linkedinUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const payload = {
      ...values,
      profileImage,
      expertiseIds: Array.from(selectedExpertise.keys()),
    };

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
        <div className="relative w-20 h-20 shrink-0">
          <Image
            src={previewUrl || "/avatar.png"}
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover ring-1 ring-gray-200 bg-gray-50"
          />
          <label
            htmlFor={fileInputId}
            className="absolute bottom-0 right-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white cursor-pointer hover:bg-blue-600 transition-colors"
            aria-label="Change profile picture"
          >
            <Image src="/upload.png" alt="" width={13} height={13} />
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={fileInputId}
            className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer w-max"
          >
            Upload photo
          </label>
          <span className="text-xs text-gray-400">
            JPEG, PNG or WEBP, up to 5MB
          </span>
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          {imageError && <p className="text-xs text-red-400">{imageError}</p>}
        </div>
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <InputField
          label="LinkedIn Profile URL"
          name="linkedinUrl"
          defaultValue={data?.linkedinUrl ?? ""}
          register={register}
          error={errors?.linkedinUrl}
          inputProps={{ placeholder: "https://www.linkedin.com/in/username" }}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Mentor Profile
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Job Role</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
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

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">
            Highest Qualification
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
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

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Mentor Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
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

        <div className="flex flex-col gap-2 w-full sm:col-span-2 lg:col-span-3">
          <label className="text-xs text-gray-500">Bio</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
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

      <span className="text-xs text-gray-400 font-medium">Expertise</span>
      <div className="flex flex-col gap-3">
        {selectedExpertise.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedExpertise.entries()).map(([id, name]) => (
              <span
                key={id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-lamaSkyLight text-gray-700"
              >
                {name}
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  className="text-gray-400 hover:text-gray-700"
                  onClick={() => toggleExpertise({ id, name })}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full sm:w-1/2 lg:w-1/3">
          <label className="text-xs text-gray-500">
            Industry (to browse more expertise to add)
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
            value={industryId ?? ""}
            onChange={(e) =>
              setIndustryId(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All industries</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {expertiseLoading && (
            <p className="text-xs text-gray-400">Loading expertise…</p>
          )}
          {!expertiseLoading && expertiseOptions.length === 0 && (
            <p className="text-xs text-gray-400">
              No expertise found for this filter.
            </p>
          )}
          {!expertiseLoading &&
            expertiseOptions.map((expertise) => (
              <label
                key={expertise.id}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={selectedExpertise.has(expertise.id)}
                  onChange={() => toggleExpertise(expertise)}
                />
                {expertise.name}
              </label>
            ))}
        </div>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto sm:self-end sm:px-8 bg-blue-400 text-white p-2 rounded-md disabled:opacity-60 hover:bg-blue-500 transition-colors"
      >
        {isSubmitting ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MentorForm;
