"use client";

import { useState } from "react";
import { Users, Search, ShieldCheck, UserX, UserCheck, MoreVertical } from "lucide-react";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  creditsBalance: number;
  role: string;
  status: "active" | "suspended";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: "u-1",
      fullName: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      creditsBalance: 150,
      role: "Creator",
      status: "active",
      createdAt: "12/10/2026",
    },
    {
      id: "u-2",
      fullName: "Lê Minh Tuấn",
      email: "tuan.le@studio.vn",
      creditsBalance: 820,
      role: "Pro",
      status: "active",
      createdAt: "05/10/2026",
    },
    {
      id: "u-3",
      fullName: "Admin Tổng",
      email: "admin@musicstudio.ai",
      creditsBalance: 9999,
      role: "Admin",
      status: "active",
      createdAt: "01/10/2026",
    },
    {
      id: "u-4",
      fullName: "Spammer Account",
      email: "bot@fake.xyz",
      creditsBalance: 0,
      role: "Free",
      status: "suspended",
      createdAt: "19/10/2026",
    },
  ]);

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản Lý Người Dùng</h1>
          <p className="mt-1 text-xs text-slate-400">
            Danh sách tài khoản, số dư credit và quyền truy cập hệ thống.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-xs text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Người dùng</th>
              <th className="p-4">Gói / Quyền</th>
              <th className="p-4">Số dư Credit</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/60 transition">
                <td className="p-4">
                  <div className="font-semibold text-white">{u.fullName}</div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                </td>
                <td className="p-4">
                  <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 font-bold text-white">{u.creditsBalance}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      u.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {u.status === "active" ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{u.createdAt}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(u.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border transition ${
                      u.status === "active"
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {u.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
