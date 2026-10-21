"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardSidebar } from "@/components/navigation/dashboard-sidebar";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { useAuthStore } from "@/stores/auth-store";
import { X, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Suspense fallback={<div className="w-64 bg-[#070b13]" />}>
          <DashboardSidebar />
        </Suspense>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#070b13]">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <Suspense fallback={<div className="p-4" />}>
              <DashboardSidebar onClose={() => setMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 pb-28">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
