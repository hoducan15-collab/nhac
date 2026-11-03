"use client";

import { useState } from "react";
import {
  Library as LibraryIcon,
  Search,
  Play,
  Heart,
  Download,
  Plus,
  Disc3,
  ListPlus,
  Filter,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";

interface Song {
  id: string;
  title: string;
  genre: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
  isFavorite: boolean;
  lyrics?: string;
  hasVocals?: boolean;
}

export default function LibraryPage() {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const [songs, setSongs] = useState<Song[]>([
    {
      id: "lib-1",
      title: "Hương Đêm Mùa Thu (Vocal Ballad)",
      genre: "Acoustic / Ballad",
      duration: 174,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      createdAt: "21/10/2026",
      isFavorite: true,
      hasVocals: true,
      lyrics:
        "[Verse 1]\nHương hoa sữa nồng nàn góc phố quen\nBước chân người nhẹ nhàng qua ánh đèn\n[Chorus]\nNhớ thương ai trong đêm dài lặng lẽ\nGửi tình yêu theo ngọn gió mơn man...",
    },
    {
      id: "lib-2",
      title: "Neon Cyber City Ride",
      genre: "Synthwave",
      duration: 156,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      createdAt: "20/10/2026",
      isFavorite: false,
      hasVocals: false,
    },
    {
      id: "lib-3",
      title: "Mưa Đêm Ban Mê (Lo-Fi Vocal)",
      genre: "Lo-Fi Hip Hop",
      duration: 185,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      createdAt: "18/10/2026",
      isFavorite: true,
      hasVocals: true,
      lyrics:
        "[Verse 1]\nTiếng mưa rơi trên mái tôn lạnh giá\nTách trà ấm giữa đêm lạnh ngút ngàn\n[Chorus]\nBình yên tìm về trong từng giai điệu\nGiữ lấy phút giây nhẹ bước thênh thang...",
    },
    {
      id: "lib-4",
      title: "Epic Journey of Dragons",
      genre: "Cinematic",
      duration: 210,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      createdAt: "16/10/2026",
      isFavorite: false,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setSongs(
      songs.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const filteredSongs = songs.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || s.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Thư Viện Bài Hát</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Tất cả các bản nhạc bạn đã tạo và lưu trữ trên hệ thống.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bài hát..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">Tất cả thể loại</option>
            <option value="Acoustic">Acoustic</option>
            <option value="Synthwave">Synthwave</option>
            <option value="Lo-Fi">Lo-Fi</option>
            <option value="Cinematic">Cinematic</option>
          </select>
        </div>
      </div>

      {/* Song List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filteredSongs.map((song) => {
            const isSongPlaying = currentTrack?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className="flex items-center justify-between p-4 hover:bg-slate-900/80 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() =>
                      playTrack({
                        id: song.id,
                        title: song.title,
                        audioUrl: song.audioUrl,
                        duration: song.duration,
                        style: song.genre,
                        lyrics: song.lyrics,
                        hasVocals: song.hasVocals,
                        isInstrumental: !song.hasVocals,
                      })
                    }
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      isSongPlaying
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-slate-800 text-slate-300 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {isSongPlaying ? (
                      <Disc3 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm truncate">{song.title}</h4>
                      {song.hasVocals && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                          Vocal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{song.genre}</span>
                      <span>•</span>
                      <span>{song.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className={`rounded-lg p-2 transition ${
                      song.isFavorite
                        ? "text-pink-500 hover:text-pink-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                    title={song.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>

                  <a
                    href={song.audioUrl}
                    download={`${song.title}.mp3`}
                    className="rounded-lg p-2 text-slate-500 hover:text-white hover:bg-slate-800 transition"
                    title="Tải về"
                  >
                    <Download className="h-4 w-4" />
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
