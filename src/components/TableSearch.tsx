"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TableSearch = ({
  placeholder = "Search...",
  paramKey = "search",
  debounceMs = 300,
}: {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === (searchParams.get(paramKey) ?? "")) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set(paramKey, trimmed);
      } else {
        params.delete(paramKey);
      }
      router.push(`${pathname}?${params.toString()}`);
    }, debounceMs);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full md:w-[200px] p-2 bg-transparent outline-none"
      />
    </div>
  );
};

export default TableSearch;
