"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/jobs", label: "Jobs" },
    { href: "/dashboard/applications", label: "Applications" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <aside
      className="
        w-[200px]                     /* Fixed width */
        min-h-screen
        pb-0                  /* Full height */
        bg-black                      /* Black background */
        text-white                   /* White text */
        border-r border-gray-800      /* Right border */
        sticky top-12 left-0           /* Stick to left */
        pt-3                           /* Padding to avoid overlap with r                         /
        overflow-y-auto               /* Scroll if content overflows */
      "
    >
      <nav className="flex flex-col space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md transition-colors duration-200
                ${isActive
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
