"use client";

import Link from "next/link";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Khởi Đầu",
    desc: "Hoàn hảo cho người mới làm quen với sáng tác nhạc AI",
    price: "0đ",
    period: "mãi mãi",
    credits: "15 credits miễn phí",
    features: [
      "Tạo tối đa 3 bài hát",
      "Chất lượng chuẩn MP3 128kbps",
      "Thời lượng tối đa 60 giây",
      "Chế độ tạo nhạc có lời & không lời",
      "Không hỗ trợ bản quyền thương mại",
    ],
    cta: "Bắt đầu miễn phí",
    href: "/studio",
    popular: false,
  },
  {
    id: "creator",
    name: "Creator",
    desc: "Dành cho nhà sáng tạo nội dung YouTube, TikTok, Podcast",
    price: "199.000đ",
    period: "/tháng",
    credits: "500 credits / tháng",
    features: [
      "Tạo khoảng 100 bài hát hoàn chỉnh",
      "Chất lượng Studio MP3 320kbps",
      "Thời lượng lên tới 3 phút / bài",
      "Quyền sở hữu bản quyền thương mại",
      "Tốc độ xử lý ưu tiên hàng đợi",
      "Lưu trữ không giới hạn dự án",
    ],
    cta: "Nâng cấp gói Creator",
    href: "/credits",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Studio",
    desc: "Dành cho nhà sản xuất chuyên nghiệp và hãng thu âm",
    price: "499.000đ",
    period: "/tháng",
    credits: "1.500 credits / tháng",
    features: [
      "Tạo khoảng 300+ bài hát chất lượng cao",
      "Định dạng Lossless WAV 24-bit + MP3",
      "Thời lượng bài hát tối đa 5 phút",
      "Bản quyền thương mại toàn cầu vĩnh viễn",
      "Hàng đợi cao cấp VIP Fast-track",
      "Hỗ trợ kỹ thuật 24/7 & API Access",
    ],
    cta: "Nâng cấp gói Pro Studio",
    href: "/credits",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-medium text-purple-300 mb-4">
          <Crown className="h-3.5 w-3.5 text-purple-400" />
          <span>Gói dịch vụ minh bạch & linh hoạt</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Chọn gói phù hợp cho hành trình âm nhạc của bạn
        </h1>
        <p className="mt-4 text-slate-300 text-sm sm:text-base">
          Mở khóa khả năng sáng tác không giới hạn với âm thanh độ phân giải cao và quyền sử dụng thương mại.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between rounded-3xl border p-8 transition duration-300 ${
              plan.popular
                ? "border-purple-500 bg-gradient-to-b from-purple-950/30 to-slate-900/90 shadow-2xl shadow-purple-950/50 scale-105 z-10"
                : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1 text-[11px] font-bold text-white shadow-md">
                ĐƯỢC CHỌN NHIỀU NHẤT
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-xs text-slate-400 min-h-[36px]">{plan.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-slate-400">{plan.period}</span>
              </div>

              <div className="mt-4 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs font-medium text-purple-300 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>{plan.credits}</span>
              </div>

              <div className="my-6 border-t border-slate-800" />

              <ul className="space-y-3 text-xs text-slate-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href={plan.href}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{plan.cta}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Credit package add-on notice */}
      <div className="mt-16 text-center max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h4 className="text-sm font-semibold text-white mb-1">Cần thêm credit linh hoạt mà không cần đăng ký tháng?</h4>
        <p className="text-xs text-slate-400 mb-4">
          Bạn có thể mua lẻ các gói credit bổ sung bất kỳ lúc nào tại mục Quản lý Credit.
        </p>
        <Link
          href="/credits"
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline"
        >
          Khám phá gói nạp Credit lẻ →
        </Link>
      </div>
    </div>
  );
}
