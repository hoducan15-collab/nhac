"use client";

import Link from "next/link";
import {
  Sparkles,
  FolderKanban,
  Music,
  Coins,
  Clock,
  Play,
  ArrowRight,
  TrendingUp,
  Disc3,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  const recentTracks = [
    {
      id: "track-101",
      title: "Hương Đêm Mùa Thu",
      style: "Acoustic Ballad • 78 BPM",
      duration: 174,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      createdAt: "Hôm nay, 14:20",
    },
    {
      id: "track-102",
      title: "Neon Cyber City Ride",
      style: "Synthwave • 120 BPM",
      duration: 156,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      createdAt: "Hôm qua",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Music Studio v2.0 Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Chào mừng trở lại, {user?.fullName || "Nhạc sĩ"}!
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Bạn có <span className="font-bold text-purple-300">{user?.creditsBalance ?? 0} credits</span> sẵn sàng. Hãy biến ý tưởng mới nhất của bạn thành giai điệu ngay hôm nay.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              <span>Sáng tác bài mới trong Studio</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              <FolderKanban className="h-4 w-4" />
              <span>Xem tất cả dự án</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Dự án đang thực hiện</span>
            <FolderKanban className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">4</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-400">
            <TrendingUp className="h-3 w-3" />
            <span>2 dự án tạo trong tuần này</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bản nhạc đã hoàn thành</span>
            <Music className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">12</div>
          <div className="mt-1 text-[11px] text-slate-400">Tất cả định dạng 320kbps</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Số dư Credit</span>
            <Coins className="h-4 w-4 text-pink-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{user?.creditsBalance ?? 0}</div>
          <div className="mt-1 text-[11px] text-pink-400">
            <Link href="/credits" className="hover:underline">
              Nạp thêm credit →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tác vụ đang xử lý</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">0</div>
          <div className="mt-1 text-[11px] text-emerald-400">Hàng đợi sẵn sàng</div>
        </div>
      </div>

      {/* Recent Generations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Bản nhạc tạo gần đây</h3>
            <Link href="/library" className="text-xs text-purple-400 hover:text-purple-300">
              Xem thư viện →
            </Link>
          </div>

          <div className="space-y-3">
            {recentTracks.map((track) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() =>
                        playTrack({
                          id: track.id,
                          title: track.title,
                          audioUrl: track.audioUrl,
                          duration: track.duration,
                          style: track.style,
                        })
                      }
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        isCurrentPlaying
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                          : "bg-slate-800 text-slate-200 hover:bg-purple-600 hover:text-white"
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <Disc3 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{track.style}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                    <span className="hidden sm:inline">{track.createdAt}</span>
                    <Link
                      href={`/projects`}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition"
                    >
                      Mở dự án
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips / Creative Prompt Ideas */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Gợi ý ý tưởng sáng tác
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Thử nghiệm các prompt được cộng đồng đánh giá cao để tìm kiếm cảm hứng âm nhạc mới:
          </p>

          <div className="space-y-2.5">
            <Link
              href="/studio?prompt=Giai+dieu+acoustic+guitar+am+ap+cho+buoi+chieu+mua+Ha+Noi&genre=Acoustic&mood=Nhe+nhang"
              className="block rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-purple-500/40 transition group"
            >
              <div className="text-xs font-medium text-purple-300 group-hover:text-purple-200">
                &ldquo;Acoustic guitar ấm áp cho buổi chiều mưa Hà Nội&rdquo;
              </div>
              <div className="mt-1 text-[10px] text-slate-500">Acoustic • Mộc mạc • 80 BPM</div>
            </Link>

            <Link
              href="/studio?prompt=Cyberpunk+electro+bass+toc+do+cao+cho+canh+ruot+duoi+dem&genre=EDM&mood=Soi+dong"
              className="block rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-purple-500/40 transition group"
            >
              <div className="text-xs font-medium text-purple-300 group-hover:text-purple-200">
                &ldquo;Cyberpunk electro bass tốc độ cao cho cảnh rượt đuổi đêm&rdquo;
              </div>
              <div className="mt-1 text-[10px] text-slate-500">EDM • Dữ dội • 135 BPM</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
