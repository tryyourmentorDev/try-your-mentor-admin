"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MENTOR_STATUSES } from "@/lib/settings";
import type { ChangeEvent } from "react";

const StatusFilter = ({
  paramKey = "status",
  label = "All statuses",
}: {
  paramKey?: string;
  label?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set(paramKey, e.target.value);
    } else {
      params.delete(paramKey);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="text-xs rounded-full ring-[1.5px] ring-gray-300 px-3 py-2 bg-transparent outline-none"
    >
      <option value="">{label}</option>
      {MENTOR_STATUSES.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
};

export default StatusFilter;
