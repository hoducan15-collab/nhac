"use client";

import { useState } from "react";
import { Cpu, Search, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";

interface AdminJob {
  id: string;
  userId: string;
  userEmail: string;
  prompt: string;
  status: "Succeeded" | "Processing" | "Failed" | "Queued";
  durationSeconds: number;
  creditCost: number;
  provider: string;
  errorMessage?: string;
  createdAt: string;
}

export default function AdminGenerationsPage() {
  const [jobs] = useState<AdminJob[]>([
    {
      id: "job-801",
      userId: "u-1",
      userEmail: "an.nguyen@gmail.com",
      prompt: "Giai điệu piano mượt mà kết hợp guitar acoustic đón ánh bình minh",
      status: "Succeeded",
      durationSeconds: 12,
      creditCost: 5,
      provider: "AudioCraft / Suno Mock Adapter",
      createdAt: "21/10/2026 14:15",
    },
    {
      id: "job-802",
      userId: "u-2",
      userEmail: "tuan.le@studio.vn",
      prompt: "Synthwave fast beat cyberpunk night drive with vocoder vocals",
      status: "Succeeded",
      durationSeconds: 18,
      creditCost: 10,
      provider: "AudioCraft / Suno Mock Adapter",
      createdAt: "21/10/2026 14:10",
    },
    {
      id: "job-803",
      userId: "u-4",
      userEmail: "bot@fake.xyz",
      prompt: "Invalid frequency modulation attack overflow",
      status: "Failed",
      durationSeconds: 3,
      creditCost: 0,
      provider: "Mock Provider Adapter",
      errorMessage: "Provider rate limit exceeded (HTTP 429). Credit refunded.",
      createdAt: "21/10/2026 13:50",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Theo Dõi Tác Vụ Tạo Nhạc (Jobs)</h1>
        <p className="mt-1 text-xs text-slate-400">
          Lịch sử hàng đợi, thời gian thực thi của worker và chi tiết lỗi từ AI provider.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Mã Job / Người dùng</th>
              <th className="p-4">Prompt</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Credit</th>
              <th className="p-4">Provider / Lỗi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-slate-900/60 transition">
                <td className="p-4">
                  <div className="font-semibold text-white">{j.id}</div>
                  <div className="text-[11px] text-slate-500">{j.userEmail}</div>
                </td>
                <td className="p-4 max-w-xs truncate" title={j.prompt}>
                  {j.prompt}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      j.status === "Succeeded"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : j.status === "Failed"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {j.status === "Succeeded" && <CheckCircle2 className="h-3 w-3" />}
                    {j.status === "Failed" && <XCircle className="h-3 w-3" />}
                    {j.status}
                  </span>
                </td>
                <td className="p-4">{j.durationSeconds}s</td>
                <td className="p-4 font-bold text-white">{j.creditCost}</td>
                <td className="p-4">
                  <div className="text-slate-300 font-medium">{j.provider}</div>
                  {j.errorMessage && (
                    <div className="text-[11px] text-red-400 mt-0.5">{j.errorMessage}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
