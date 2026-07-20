"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      //   {
      //     icon: "/home.png",
      //     label: "Home",
      //     href: "/",
      //     visible: ["admin", "mentor", "student", "parent"],
      //   },
      {
        icon: "/mentor.png",
        label: "Mentors",
        href: "/list/mentors",
        visible: ["admin", "mentor"],
      },
      {
        icon: "/student.png",
        label: "Mentees",
        href: "/list/mentees",
        visible: ["admin", "mentor"],
      },
      {
        icon: "/subject.png",
        label: "Sessions",
        href: "/sessions",
        visible: ["admin"],
      },
      {
        icon: "/calendar.png",
        label: "Bookings",
        href: "/list/bookings",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Courses",
        href: "/courses",
        visible: ["admin"],
      },
      {
        icon: "/lesson.png",
        label: "News",
        href: "/news",
        visible: ["admin"],
      },
      {
        icon: "/announcement.png",
        label: "Promotions",
        href: "/promotions",
        visible: ["admin"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "mentor", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "mentor", "student", "parent"],
      },
      // {
      //   icon: "/logout.png",
      //   label: "Logout",
      //   href: "/logout",
      //   visible: ["admin", "mentor", "student", "parent"],
      // },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="block md:hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center justify-start md:justify-center lg:justify-start gap-4 py-2 px-2 rounded-md border-l-4 transition-colors ${
                  active
                    ? "bg-lamaSkyLight text-gray-900 font-semibold border-lamaSky"
                    : "text-gray-500 border-transparent hover:bg-lamaSkyLight"
                }`}
              >
                <Image src={item.icon} alt="" width={20} height={20} />
                <span className="block md:hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
