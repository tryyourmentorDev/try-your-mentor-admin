"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, isLoaded } = useUser();

  const displayName = isLoaded
    ? user?.fullName ||
      user?.primaryEmailAddress?.emailAddress ||
      "Admin"
    : "";

  return (
    <div className="flex items-center justify-between gap-2 p-4 bg-white md:bg-transparent border-b border-gray-100 md:border-none">
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        aria-label="Open menu"
        className="md:hidden p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-3 sm:gap-6 justify-end flex-1 min-w-0">
        <div className="hidden sm:flex bg-white rounded-full w-7 h-7 items-center justify-center cursor-pointer shrink-0">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="hidden sm:flex bg-white rounded-full w-7 h-7 items-center justify-center cursor-pointer relative shrink-0">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            0
          </div>
        </div>
        <div className="hidden sm:flex flex-col min-w-0 text-right">
          <span className="text-xs leading-3 font-medium truncate max-w-[140px]">
            {displayName}
          </span>
          <span className="text-[10px] text-gray-500">Admin</span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
