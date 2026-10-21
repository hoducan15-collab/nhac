"use client";

import Link from "next/link";
import { Music2, Disc3, Globe } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060910] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
                <Music2 className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white">
                Music<span className="text-purple-400">Studio</span> AI
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng sáng tạo âm nhạc đột phá kết hợp trí tuệ nhân tạo, cho phép bạn biến mọi ý tưởng và cảm xúc thành bản nhạc hoàn chỉnh trong chớp mắt.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/studio" className="hover:text-purple-400 transition">
                  AI Music Studio
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-purple-400 transition">
                  Gói dịch vụ & Bảng giá
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-purple-400 transition">
                  Thư viện âm nhạc
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-purple-400 transition">
                  Quản lý dự án
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Tài nguyên</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#features" className="hover:text-purple-400 transition">
                  Hướng dẫn tạo prompt
                </Link>
              </li>
              <li>
                <Link href="#genres" className="hover:text-purple-400 transition">
                  Danh mục phong cách & thể loại
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-purple-400 transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <span className="text-slate-500">API Developer (Coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Pháp lý & Hỗ trợ</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Điều khoản dịch vụ
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Chính sách bản quyền âm nhạc
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Bảo mật thông tin
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  support@musicstudio.ai
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MusicStudio AI. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Disc3 className="h-4 w-4 text-purple-400" />
              Sẵn sàng phục vụ nhà sáng tạo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
