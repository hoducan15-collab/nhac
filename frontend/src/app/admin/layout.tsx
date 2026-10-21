"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Cpu,
  Receipt,
  LayoutDashboard,
  ArrowLeft,
  Music2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const ADMIN_NAV = [
  { name: "Tổng quan Admin", href: "/admin", icon: LayoutDashboard },
  { name: "Quản lý Người dùng", href: "/admin/users", icon: Users },
  { name: "Tác vụ Tạo nhạc (Jobs)", href: "/admin/generations", icon: Cpu },
  { name: "Giao dịch & Nạp tiền", href: "/admin/transactions", icon: Receipt },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-[#060910] text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#080d17] p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Quản Trị Hệ Thống</span>
              <p className="text-[10px] text-red-400">Admin Control Center</p>
            </div>
          </div>

          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-red-600/20 text-red-300 border border-red-500/30"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về App Người Dùng</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-[#080d17]/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-400">
              ROLE: SYSTEM ADMINISTRATOR
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Đăng nhập bởi: <strong className="text-white">{user?.email}</strong>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
