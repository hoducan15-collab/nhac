"use client";

import Link from "next/link";
import { Music2, Sparkles, ArrowRight } from "lucide-react";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Music2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Music<span className="text-purple-400">Studio</span>
          </span>
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-500/20">
            AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-purple-400 transition">
            Trang chủ
          </Link>
          <Link href="#features" className="hover:text-purple-400 transition">
            Tính năng
          </Link>
          <Link href="#genres" className="hover:text-purple-400 transition">
            Thể loại
          </Link>
          <Link href="/pricing" className="hover:text-purple-400 transition">
            Bảng giá
          </Link>
          <Link href="#faq" className="hover:text-purple-400 transition">
            Hỏi đáp
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Sáng tác ngay</span>
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
