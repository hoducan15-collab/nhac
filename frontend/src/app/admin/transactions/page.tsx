"use client";

import { useState } from "react";
import { Receipt, CheckCircle2, Clock, XCircle, Search } from "lucide-react";

interface Transaction {
  id: string;
  orderCode: string;
  userEmail: string;
  amountVnd: number;
  creditsGranted: number;
  paymentGateway: string;
  status: "Completed" | "Pending" | "Failed";
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions] = useState<Transaction[]>([
    {
      id: "tx-501",
      orderCode: "ORD-20261021-991",
      userEmail: "an.nguyen@gmail.com",
      amountVnd: 129000,
      creditsGranted: 350,
      paymentGateway: "VNPay / QR",
      status: "Completed",
      createdAt: "21/10/2026 13:40",
    },
    {
      id: "tx-502",
      orderCode: "ORD-20261021-992",
      userEmail: "tuan.le@studio.vn",
      amountVnd: 499000,
      creditsGranted: 1500,
      paymentGateway: "Credit Card / Stripe",
      status: "Completed",
      createdAt: "21/10/2026 12:15",
    },
    {
      id: "tx-503",
      orderCode: "ORD-20261021-993",
      userEmail: "guest@musicstudio.ai",
      amountVnd: 49000,
      creditsGranted: 0,
      paymentGateway: "MoMo Wallet",
      status: "Failed",
      createdAt: "21/10/2026 10:05",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản Lý Giao Dịch & Nạp Tiền</h1>
        <p className="mt-1 text-xs text-slate-400">
          Theo dõi các hóa đơn nạp credit và kiểm tra trạng thái webhook đối soát cổng thanh toán.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
            <tr>
              <th className="p-4">Mã Đơn / Khách hàng</th>
              <th className="p-4">Số tiền (VNĐ)</th>
              <th className="p-4">Credit cấp</th>
              <th className="p-4">Cổng thanh toán</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-900/60 transition">
                <td className="p-4">
                  <div className="font-semibold text-white">{tx.orderCode}</div>
                  <div className="text-[11px] text-slate-500">{tx.userEmail}</div>
                </td>
                <td className="p-4 font-bold text-white">
                  {tx.amountVnd.toLocaleString("vi-VN")}đ
                </td>
                <td className="p-4 font-semibold text-purple-400">
                  +{tx.creditsGranted}
                </td>
                <td className="p-4">{tx.paymentGateway}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      tx.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : tx.status === "Failed"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {tx.status === "Completed" && <CheckCircle2 className="h-3 w-3" />}
                    {tx.status === "Failed" && <XCircle className="h-3 w-3" />}
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{tx.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
