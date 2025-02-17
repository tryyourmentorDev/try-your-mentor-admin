import Image from "next/image";
import Link from "next/link";

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
        href: "/list/sessions",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Courses",
        href: "/list/courses",
        visible: ["admin"],
      },
      {
        icon: "/lesson.png",
        label: "News",
        href: "/list/news",
        visible: ["admin"],
      },
      {
        icon: "/announcement.png",
        label: "Promotions",
        href: "/list/Promotions",
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
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
            >
              <Image src={item.icon} alt="" width={20} height={20} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
