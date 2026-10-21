"use client";

import { useState } from "react";
import {
  Coins,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  History,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface LedgerItem {
  id: string;
  type: "deposit" | "generation_hold" | "generation_settle" | "refund";
  amount: number;
  description: string;
  createdAt: string;
  status: "success" | "pending" | "failed";
}

const CREDIT_PACKAGES = [
  { id: "pkg-100", credits: 100, price: "49.000đ", bonus: "+0 bonus" },
  { id: "pkg-300", credits: 350, price: "129.000đ", bonus: "+50 bonus", popular: true },
  { id: "pkg-1000", credits: 1200, price: "399.000đ", bonus: "+200 bonus" },
];

export default function CreditsPage() {
  const { user, updateCredits } = useAuthStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [ledger, setLedger] = useState<LedgerItem[]>([
    {
      id: "led-1",
      type: "deposit",
      amount: +50,
      description: "Thưởng chào mừng đăng ký tài khoản",
      createdAt: "21/10/2026 14:00",
      status: "success",
    },
    {
      id: "led-2",
      type: "generation_settle",
      amount: -5,
      description: "Tạo bài hát: Khúc Hát Ban Mai (Demo v1)",
      createdAt: "21/10/2026 14:15",
      status: "success",
    },
  ]);

  const handleStartCheckout = (pkg: any) => {
    setSelectedPkg(pkg);
    setPaymentSuccess(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate secure backend checkout and webhook fulfillment
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      const newBalance = (user?.creditsBalance ?? 0) + selectedPkg.credits;
      updateCredits(newBalance);

      const newEntry: LedgerItem = {
        id: "led-" + Date.now(),
        type: "deposit",
        amount: selectedPkg.credits,
        description: `Nạp gói ${selectedPkg.credits} Credits qua chuyển khoản`,
        createdAt: "Vừa xong",
        status: "success",
      };
      setLedger([newEntry, ...ledger]);
    }, 1800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
              <Coins className="h-3.5 w-3.5" />
              <span>Ví Credit Sáng Tác</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Quản Lý & Nạp Credit</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">
              Credit dùng để tạo bản nhạc, xuất file chất lượng cao và hòa âm giọng hát AI.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-white">
              {user?.creditsBalance ?? 0}
            </span>
            <span className="text-sm font-semibold text-purple-300">Credits khả dụng</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              Chính sách bảo toàn Credit
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Nếu tác vụ tạo nhạc gặp lỗi từ provider hoặc hệ thống, số credit đã giữ chỗ sẽ được tự động hoàn trả 100% vào tài khoản ngay lập tức.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            Mỗi bài nhạc tiêu chuẩn tốn khoảng 5 - 10 credits.
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" />
          Gói nạp Credit bổ sung
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border p-6 flex flex-col justify-between transition ${
                pkg.popular
                  ? "border-purple-500 bg-purple-950/20 shadow-xl shadow-purple-950/40"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-[10px] font-bold text-white">
                  PHỔ BIẾN NHẤT
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{pkg.credits} Credits</span>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {pkg.bonus}
                  </span>
                </div>
                <div className="mt-4 text-3xl font-extrabold text-white">{pkg.price}</div>
              </div>

              <button
                onClick={() => handleStartCheckout(pkg)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition"
              >
                Nạp ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-purple-400" />
          Lịch sử giao dịch & biến động số dư (Credit Ledger)
        </h2>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="divide-y divide-slate-800/80">
            {ledger.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-slate-900/80 transition text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      item.amount > 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {item.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">{item.description}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.createdAt}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold ${
                      item.amount > 0 ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {item.amount > 0 ? `+${item.amount}` : item.amount} Credits
                  </div>
                  <span className="text-[10px] text-emerald-400/80">Hoàn tất</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0d1322] p-6 sm:p-8 shadow-2xl">
            {paymentSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Thanh toán thành công!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đã cộng thành công{" "}
                  <strong className="text-purple-300">{selectedPkg.credits} Credits</strong> vào tài khoản của bạn.
                </p>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="mt-4 w-full rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white hover:bg-purple-500 transition"
                >
                  Xong & Tiếp tục sáng tác
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Xác nhận đơn hàng</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gói nạp: <strong className="text-white">{selectedPkg.credits} Credits</strong>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Số lượng credit:</span>
                    <span className="font-semibold text-white">{selectedPkg.credits}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Khuyến mãi bonus:</span>
                    <span className="text-purple-400">{selectedPkg.bonus}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-purple-300">{selectedPkg.price}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-purple-950/20 border border-purple-500/20 p-3 text-[11px] text-purple-300 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span>Mô phỏng cổng thanh toán VNPay / MoMo / Stripe an toàn</span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    disabled={isProcessing}
                    onClick={() => setIsCheckoutOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-purple-500 hover:to-indigo-500 shadow-md transition disabled:opacity-50"
                  >
                    {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
