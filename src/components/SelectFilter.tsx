"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

// Generic URL-param backed <select> filter (mirrors StatusFilter but takes its
// options as a prop, so it works for session status, contacted, mentor, etc.).
const SelectFilter = ({
  paramKey,
  label,
  options,
}: {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
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
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectFilter;
