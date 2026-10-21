"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { formatTime } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Download,
  Music,
  Disc3,
} from "lucide-react";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    closePlayer,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync play/pause with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked or playback error:", err);
        pause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  // Sync volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    if (!currentTrack.audioUrl) return;
    const a = document.createElement("a");
    a.href = currentTrack.audioUrl;
    a.download = `${currentTrack.title.replace(/\s+/g, "_")}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0d1322]/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => pause()}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Track info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md">
            {isPlaying ? (
              <Disc3 className="h-6 w-6 animate-spin text-purple-200" style={{ animationDuration: "3s" }} />
            ) : (
              <Music className="h-6 w-6 text-purple-200" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-slate-100">{currentTrack.title}</h4>
            <p className="truncate text-xs text-slate-400">
              {currentTrack.style || currentTrack.prompt || "Bản nhạc sáng tác bởi AI"}
            </p>
          </div>
        </div>

        {/* Play controls & Seekbar */}
        <div className="flex flex-1 max-w-2xl flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-md transition hover:bg-purple-500 hover:scale-105 active:scale-95"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
          </div>

          <div className="flex w-full items-center gap-3 text-xs text-slate-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-purple-500"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition"
              aria-label="Tắt/bật âm"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-purple-500"
            />
          </div>

          <button
            onClick={handleDownload}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Tải bài nhạc"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={closePlayer}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Đóng thanh phát nhạc"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
