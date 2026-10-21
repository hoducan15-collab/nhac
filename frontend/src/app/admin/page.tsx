"use client";

import {
  Users,
  Cpu,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Tổng Quan Quản Trị</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Theo dõi số lượng người dùng, hiệu năng tác vụ AI và dòng tiền giao dịch thời gian thực.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng người dùng</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">1,248</div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+12% tuần này</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tác vụ tạo nhạc (Jobs)</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">4,812</div>
          <div className="mt-1 text-[11px] text-indigo-400">Tỷ lệ thành công 99.2%</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doanh thu tháng (VNĐ)</span>
            <Receipt className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">48.650.000đ</div>
          <div className="mt-1 text-[11px] text-emerald-400">+18% so với tháng trước</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ lệ lỗi Provider</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">0.8%</div>
          <div className="mt-1 text-[11px] text-emerald-400">Ngưỡng an toàn (&lt; 2%)</div>
        </div>
      </div>

      {/* System Health Status */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          Tình trạng dịch vụ hạ tầng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <span className="text-slate-300">ASP.NET Core API</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Hoạt động tốt
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <span className="text-slate-300">Music Generation Worker</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sẵn sàng
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <span className="text-slate-300">SignalR Realtime Hub</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Kết nối ổn định
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
