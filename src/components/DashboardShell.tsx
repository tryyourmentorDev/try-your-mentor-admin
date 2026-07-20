"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Menu from "./Menu";
import Navbar from "./Navbar";

// Wraps the sidebar + navbar in a client boundary so the sidebar can slide
// in/out as a mobile drawer. Desktop keeps the original icon/label static
// sidebar; below the md breakpoint it becomes an off-canvas panel toggled
// from the hamburger button in Navbar.
const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer automatically whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="h-screen flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 overflow-y-auto shadow-xl transition-transform duration-200 ease-in-out
          md:static md:z-auto md:w-[8%] lg:w-[16%] xl:w-[14%] md:bg-transparent md:shadow-none md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between md:justify-center lg:justify-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <span className="font-bold block md:hidden lg:block">
              TYM Admin
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden p-1.5 -mr-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <Menu />
      </aside>

      {/* RIGHT */}
      <div className="flex-1 min-w-0 bg-[#F7F8FA] overflow-y-auto flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
};

export default DashboardShell;
