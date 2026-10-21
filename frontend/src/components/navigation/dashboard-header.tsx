"use client";

import Link from "next/link";
import { Sparkles, Menu, Bell, Coins, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#080c14]/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 md:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/credits"
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 transition"
        >
          <Coins className="h-3.5 w-3.5 text-purple-400" />
          <span>{user?.creditsBalance ?? 0} Credits</span>
        </Link>

        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/25 transition hover:from-purple-500 hover:to-indigo-500"
        >
          <Plus className="h-4 w-4" />
          <span>Sáng tác bài mới</span>
        </Link>
      </div>
    </header>
  );
}
