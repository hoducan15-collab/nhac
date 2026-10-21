"use client";

import { useState } from "react";
import { User, Lock, Shield, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || "Nhà sáng tạo");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({ ...user, fullName });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus("Mật khẩu mới cần tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("Mật khẩu xác nhận không trùng khớp");
      return;
    }
    setPasswordStatus("success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordStatus(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cài Đặt Tài Khoản</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Cập nhật thông tin hồ sơ và bảo mật tài khoản của bạn.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-purple-400" />
          Thông tin cá nhân
        </h2>

        {profileSaved && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Đã cập nhật thông tin thành công.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Địa chỉ Email (Định danh tài khoản)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || "user@musicstudio.ai"}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Email dùng để xác thực và nhận thông báo hoàn tất bài nhạc.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
          >
            <Save className="h-4 w-4" />
            <span>Lưu thay đổi</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-400" />
          Đổi mật khẩu
        </h2>

        {passwordStatus === "success" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Đổi mật khẩu thành công!</span>
          </div>
        )}

        {passwordStatus && passwordStatus !== "success" && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordStatus}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <span>Cập nhật mật khẩu</span>
          </button>
        </form>
      </div>
    </div>
  );
}
