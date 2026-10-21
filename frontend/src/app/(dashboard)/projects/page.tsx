"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  Music,
  Calendar,
  MoreVertical,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tracksCount: number;
  lastUpdated: string;
  genre: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj-1",
      title: "Album Hoàng Hôn Mùa Thu",
      description: "Tập hợp các bản Acoustic Ballad nhẹ nhàng",
      tracksCount: 4,
      lastUpdated: "21/10/2026",
      genre: "Acoustic / Ballad",
    },
    {
      id: "proj-2",
      title: "Cyberpunk 2099 OST",
      description: "Nhạc nền game thể loại điện tử năng lượng cao",
      tracksCount: 6,
      lastUpdated: "18/10/2026",
      genre: "Synthwave / Cyberpunk",
    },
    {
      id: "proj-3",
      title: "Lo-Fi Study Session",
      description: "Chuỗi beat chill phục vụ livestream và học tập",
      tracksCount: 8,
      lastUpdated: "15/10/2026",
      genre: "Lo-Fi Hip Hop",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: Project = {
      id: "proj-" + Date.now(),
      title: newTitle,
      description: newDesc || "Dự án âm nhạc mới",
      tracksCount: 0,
      lastUpdated: "Vừa xong",
      genre: "Đa thể loại",
    };

    setProjects([newProj, ...projects]);
    setNewTitle("");
    setNewDesc("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dự án này? Tất cả phiên bản nhạc bên trong sẽ bị xóa.")) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Quản Lý Dự Án</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Tổ chức các ý tưởng âm nhạc, album và phiên bản sáng tác của bạn.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo dự án mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm dự án theo tên hoặc thể loại..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-purple-500/40 transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition"
                  title="Xóa dự án"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-4 text-base font-bold text-white group-hover:text-purple-300 transition">
                {p.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                {p.description}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-md bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                  {p.genre}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-purple-400" />
                {p.tracksCount} bản nhạc
              </span>

              <Link
                href={`/projects/${p.id}`}
                className="inline-flex items-center gap-1 font-medium text-purple-400 hover:text-purple-300"
              >
                <span>Chi tiết</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal create project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Tạo dự án âm nhạc mới</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tên dự án *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Giai Điệu Mùa Xuân EP"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mục tiêu hoặc phong cách chủ đạo..."
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
                  Tạo dự án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
