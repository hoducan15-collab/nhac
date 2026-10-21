"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Music2,
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  Library,
  ListMusic,
  Coins,
  Settings,
  ShieldAlert,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Studio", href: "/studio", icon: Sparkles, highlight: true },
  { name: "Dự án âm nhạc", href: "/projects", icon: FolderKanban },
  { name: "Thư viện bài hát", href: "/library", icon: Library },
  { name: "Playlists", href: "/playlists", icon: ListMusic },
  { name: "Nạp & Quản lý Credit", href: "/credits", icon: Coins },
  { name: "Cài đặt tài khoản", href: "/settings", icon: Settings },
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.roles?.includes("Admin");

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-800 bg-[#070b13] p-4 text-slate-300">
      <div>
        {/* Logo */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-3 rounded-xl hover:bg-slate-900 transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Music2 className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Music<span className="text-purple-400">Studio</span>
          </span>
          <span className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-400 border border-purple-500/20">
            PRO
          </span>
        </Link>

        {/* Credit Quick Balance Card */}
        <div className="mt-4 mx-1 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-slate-900/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Số dư Credit</span>
            <Coins className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white">
              {user?.creditsBalance ?? 0}
            </span>
            <span className="text-[11px] text-purple-300">credits</span>
          </div>
          <Link
            href="/credits"
            onClick={onClose}
            className="mt-2.5 block text-center rounded-lg bg-purple-600/30 border border-purple-500/40 py-1 text-[11px] font-semibold text-purple-200 hover:bg-purple-600/50 transition"
          >
            + Nạp thêm Credit
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? item.highlight
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-slate-800 text-white font-semibold"
                    : item.highlight
                    ? "text-purple-300 hover:bg-purple-950/40 hover:text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.highlight ? "text-purple-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition mt-4 ${
                pathname.startsWith("/admin")
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "text-red-400 hover:bg-red-500/10"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Quản trị viên (Admin)</span>
            </Link>
          )}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-purple-400 font-bold border border-slate-700">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user?.fullName || "Nhà sáng tạo"}
            </p>
            <p className="truncate text-[10px] text-slate-500">{user?.email || "Chưa đăng nhập"}</p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
