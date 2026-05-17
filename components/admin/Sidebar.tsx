"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext"; // adjust path as needed
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Megaphone,
  BarChart2,
  BookOpen,
  UserCheck,
  Stethoscope,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",      icon: LayoutDashboard },
  { label: "Appointments",   href: "/dashboard/Appointments",   icon: CalendarDays },
  { label: "Patients",       href: "/dashboard/Patient",       icon: Users },
  { label: "Clinical Notes", href: "/dashboard/Clinical_Note", icon: FileText },
  { label: "Marketing",      href: "/admin/marketing",      icon: Megaphone },
  { label: "Analytics",      href: "/admin/analytics",      icon: BarChart2 },
  { label: "Blogs",          href: "/admin/blogs",          icon: BookOpen },
  { label: "Subscribers",    href: "/admin/subscribers",    icon: UserCheck },
  { label: "Specialities",   href: "/admin/specialities",   icon: Stethoscope },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={`
        flex flex-col h-[600px] w-[260px] fixed m-2 rounded-2xl mt-3 left-0 top-0 z-40
        transition-colors duration-300
        ${isDark
          ? "bg-[#F2E5C5] text-[#711C31]"          // dark: deep maroon bg, warm cream text
          : "bg-[#711C31] text-[#F2E5C5]"           // light: warm cream bg, maroon text
        }
      `}
    >
      {/* ── Logo ─────────────────────────────────── */}
     <div className="flex flex-col ml-2 gap-2 pt-10 pb-6  ">
  
  <div className="overflow-hidden rounded-full">
    <Image
  src="/images/logo1.png"
  alt="Atlas Dental Center"
  width={180}
  height={180}
  className={`object-contain transition-all duration-300 hover:scale-110 ${
    isDark ? "brightness-0 sepia hue-rotate-[320deg] saturate-100" : ""
  }`}
/>
  </div>

</div>

      {/* ── Nav Items ────────────────────────────── */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-hidden">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
  pathname === href ||
  (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 group
               ${isActive
  ? isDark
    ? "bg-[#D4A574] text-[#3D0A1F]"
    : "bg-[#3D0A1F] text-[#F5ECD7]"
  : isDark
    ? "text-[#711C31] hover:bg-[#5C1A30] hover:text-[#D4A574]"
    : "text-[#F5ECD7] hover:bg-[#EBD9B8] hover:text-[#5C1A30]"
}
              `}
            >
              <Icon
                size={17}
                className={`
                  shrink-0 transition-colors duration-200
                  ${isActive
                    ? isDark ? "text-[#F2E5C5]" : "text-[#F2E5C5]"
                    : isDark ? "text-[#591727]" : "text-[#F2E5C5]"
                  }
                `}
              />
 <span
>
  {label}
</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ──────────────────────────────── */}
      <div
        className={`mx-4 my-3 h-px ${isDark ? "bg-[#5C1A30]" : "bg-[#D4B896]"}`}
      />

      {/* ── Settings ─────────────────────────────── */}
      <div className="px-3 pb-6">
        <Link
          href="/admin/settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${pathname === "/admin/settings"
  ? isDark
    ? "bg-[#D4A574] text-[#3D0A1F]"
    : "bg-[#3D0A1F] text-[#F5ECD7]"
  : isDark
    ? "text-[#711C31] hover:bg-[#5C1A30] hover:text-white"
    : "text-[#F5ECD7] hover:bg-[#EBD9B8] hover:text-white"
}
          `}
        >
          <Settings
  size={17}
  className="shrink-0"
/>
          <span style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}>
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
