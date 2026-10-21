"use client";

import { useState } from "react";
import { ListMusic, Plus, Play, Music, Trash2, Disc3 } from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";

interface Playlist {
  id: string;
  name: string;
  description: string;
  songsCount: number;
  coverGradient: string;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "pl-1",
      name: "Tập Trung Học Tập & Code",
      description: "Tuyển tập Lo-Fi beats thư giãn",
      songsCount: 12,
      coverGradient: "from-purple-600 to-indigo-600",
    },
    {
      id: "pl-2",
      name: "Cyberpunk Night Drive",
      description: "Âm hưởng synthwave năng lượng cao cho ban đêm",
      songsCount: 8,
      coverGradient: "from-pink-600 to-purple-600",
    },
    {
      id: "pl-3",
      name: "Nhạc Nền Video Vlog",
      description: "Acoustic nhẹ nhàng phù hợp lồng tiếng",
      songsCount: 6,
      coverGradient: "from-indigo-600 to-cyan-600",
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setPlaylists([
      ...playlists,
      {
        id: "pl-" + Date.now(),
        name: newName,
        description: newDesc,
        songsCount: 0,
        coverGradient: "from-violet-600 to-fuchsia-600",
      },
    ]);
    setNewName("");
    setNewDesc("");
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Danh Sách Phát (Playlists)</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Tuyển tập và phân loại các bản nhạc theo mục đích sử dụng.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Playlist mới</span>
        </button>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-purple-500/40 transition group"
          >
            <div
              className={`h-36 w-full rounded-xl bg-gradient-to-tr ${pl.coverGradient} flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
            >
              <ListMusic className="h-12 w-12 opacity-80" />
            </div>

            <div className="mt-4 flex-1">
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                {pl.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{pl.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{pl.songsCount} bài hát</span>
              <button
                onClick={() =>
                  alert(`Đang mở playlist: ${pl.name}`)
                }
                className="text-purple-400 hover:text-purple-300 font-semibold text-xs"
              >
                Mở playlist →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Tạo Playlist mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tên Playlist *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nhạc nền Podcast"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả phong cách hoặc mục đích..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                >
                  Tạo Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
