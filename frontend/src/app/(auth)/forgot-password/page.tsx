"use client";

import { useState } from "react";
import Link from "next/link";
import { Music2, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#080c14]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
              <Music2 className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Khôi phục mật khẩu</h2>
          <p className="mt-2 text-xs text-slate-400">
            Nhập email của bạn để nhận liên kết thiết lập lại mật khẩu
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-purple-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Email đã được gửi</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Nếu địa chỉ <strong className="text-purple-300">{email}</strong> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến hộp thư của bạn.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email">
                Địa chỉ Email đã đăng ký
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@musicstudio.ai"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Gửi liên kết khôi phục</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
