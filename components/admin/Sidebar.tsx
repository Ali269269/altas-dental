"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/utils/auth";
import { usePermissions } from "@/context/PermissionsContext";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Megaphone,
  BarChart2,
  BookOpen,
  UserCheck,
  Stethoscope,
  Settings,
  Shield,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { label: "Appointments", href: "/dashboard/Appointments", icon: CalendarDays, module: "appointments" },
  { label: "Patients", href: "/dashboard/Patients", icon: Users, module: "patients" },
  { label: "Admin Management", href: "/dashboard/Admin_Management", icon: Shield, module: "admin_management" },
  { label: "Marketing", href: "/dashboard/Marketing", icon: Megaphone, module: "marketing" },
  { label: "Analytics", href: "/dashboard/Analytics", icon: BarChart2, module: "analytics" },
  { label: "Blogs", href: "/dashboard/Blogs", icon: BookOpen, module: "blogs" },
  { label: "Subscribers", href: "/dashboard/Subcribers", icon: UserCheck, module: "subscribers" },
  { label: "Specialities", href: "/dashboard/Specialities", icon: Stethoscope, module: "specialities" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { canViewModule } = usePermissions();
  const visibleNavItems = navItems.filter((item) => canViewModule(item.module));

const handleLogout = async () => {
  await logout();
  router.replace("/login");
};

  const sidebarBg    = isDark ? "bg-[#FFFFFF] text-[#711C31]" : "bg-[#711C31] text-[#FFFFFF]";
  const dividerColor = isDark ? "bg-[#5C1A30]" : "bg-[#D4B896]";

  const logoEl = (
    <div className="flex flex-col ml-2 gap-2 pt-2 pb-6">
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
  );

  const settingsVisible = canViewModule("settings");

  const navLinks = visibleNavItems.map(({ label, href, icon: Icon }) => {
    const isActive =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href + "/"));

    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 group
          ${isActive
            ? isDark
              ? "bg-[#D3D3D3D3] text-[#3d1023]"
              : "bg-[#3D0A1F] text-[#F5ECD7]"
            : isDark
              ? "text-[#711C31] hover:bg-[#D3D3D3D3]"
              : "text-[#F5ECD7] hover:bg-[#3D1023]"
          }
        `}
      >
        <Icon
          size={17}
          className={`shrink-0 transition-colors duration-200
            ${isActive
              ? isDark ? "text-[#591727]" : "text-[#F2E5C5]"
              : isDark ? "text-[#591727]" : "text-[#F2E5C5]"
            }
          `}
        />
        <span>{label}</span>
      </Link>
    );
  });

  const settingsLink = settingsVisible ? (
    <Link
      href="/dashboard/Settings"
      onClick={onClose}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${pathname === "/admin/settings"
          ? isDark
            ? "bg-[#D4A574] text-[#3D0A1F]"
            : "bg-[#3D0A1F] text-[#F5ECD7]"
          : isDark
            ? "text-[#711C31] hover:bg-[#5C1A30] hover:text-white"
            : "text-[#F5ECD7] hover:bg-[#3D1023] hover:text-white"
        }
      `}
    >
      <Settings size={17} className="shrink-0" />
      <span style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}>Settings</span>
    </Link>
  ) : null;
const logoutButton = (
  <button
    onClick={handleLogout}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
      transition-all duration-200
      ${
        isDark
          ? "text-[#711C31] hover:bg-[#D3D3D3D3]"
          : "text-[#F5ECD7] hover:bg-[#3D1023]"
      }
    `}
  >
    <LogOutIcon size={17} className="shrink-0" />
    <span>Logout</span>
  </button>
);
  return (
    <>
      {/* ── Desktop: fixed sidebar ── */}
      <div className="hidden lg:block fixed m-2 mt-3 left-0 top-0 z-40 h-[calc(100vh-20px)] w-[260px]">
        <aside className={`flex flex-col h-full w-[260px] rounded-2xl transition-colors duration-300 ${sidebarBg}`}>
          {logoEl}
          <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
  {navLinks}
</nav>
          <div className={`mx-4 my-3 h-px ${dividerColor}`} />
         <div className="px-3 pb-2">
  {settingsLink}
</div>

<div className="px-3 pb-6">
  {logoutButton}
</div>
        </aside>
      </div>

      {/* ── Mobile: drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 overflow-hidden"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Drawer */}
          <aside
            className={`absolute top-0 left-0 h-full w-[260px] flex flex-col transition-colors duration-300 ${sidebarBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? "text-[#711C31] hover:bg-[#D3D3D3D3]" : "text-white hover:bg-[#3D1023]"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {logoEl}

           <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
  {navLinks}
</nav>

            <div className={`mx-4 my-3 h-px ${dividerColor}`} />

            <div className="px-3 pb-2">
  {settingsLink}
</div>

<div className="px-3 pb-6">
  {logoutButton}
</div>
          </aside>
        </div>
      )}
    </>
  );
}