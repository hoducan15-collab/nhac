"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Music,
  Play,
  Download,
  Calendar,
  Disc3,
  Sliders,
  Layers,
  Loader2,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProjectDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  const project = {
    id: resolvedParams.id,
    title: "Album Hoàng Hôn Mùa Thu",
    description: "Bộ sưu tập các giai điệu mộc mạc mang cảm hứng acoustic chiều tà.",
    genre: "Acoustic / Ballad",
    createdAt: "15/10/2026",
    versions: [
      {
        id: "v-1",
        versionName: "v1.0 (Master Mix)",
        title: "Hoàng Hôn Mùa Thu - Bản Gốc",
        prompt: "Acoustic guitar ấm áp với piano chậm rãi, nhịp điệu 75 BPM, tiếng lá xào xạc",
        duration: 174,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        createdAt: "15/10/2026 14:30",
        bpm: 75,
      },
      {
        id: "v-2",
        versionName: "v2.0 (Remix Lofi)",
        title: "Hoàng Hôn Mùa Thu - Chill Beat",
        prompt: "Phối lại theo phong cách Lo-Fi beat, thêm tiếng mưa nhẹ và vinyl crackle",
        duration: 162,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        createdAt: "16/10/2026 09:15",
        bpm: 82,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Back button & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách dự án</span>
        </Link>

        <Link
          href={`/studio?projectId=${project.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-500 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Tạo phiên bản mới trong Studio</span>
        </Link>
      </div>

      {/* Project Meta Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-300">
            {project.genre}
          </span>
          <span className="text-xs text-slate-500">Khởi tạo: {project.createdAt}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{project.title}</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">{project.description}</p>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-purple-400" />
          Danh sách các phiên bản đã tạo ({project.versions.length})
        </h2>

        <div className="space-y-3">
          {project.versions.map((ver) => {
            const isVerPlaying = currentTrack?.id === ver.id && isPlaying;
            return (
              <div
                key={ver.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() =>
                      playTrack({
                        id: ver.id,
                        title: ver.title,
                        audioUrl: ver.audioUrl,
                        duration: ver.duration,
                        style: project.genre,
                      })
                    }
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                      isVerPlaying
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-800 text-slate-200 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {isVerPlaying ? (
                      <Disc3 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm truncate">{ver.title}</h4>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {ver.versionName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">{ver.prompt}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>{ver.bpm} BPM</span>
                      <span>•</span>
                      <span>{ver.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={ver.audioUrl}
                    download={`${ver.title}.mp3`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải về</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <ProjectDetailContent {...props} />
    </Suspense>
  );
}
