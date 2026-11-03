"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { formatTime } from "@/lib/utils";
import { VocalEngine, LyricLine } from "@/lib/vocal-engine";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Download,
  Music,
  Disc3,
  Mic,
  MicOff,
  FileText,
  Sparkles,
} from "lucide-react";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    vocalEnabled,
    vocalVolume,
    vocalGender,
    currentLyricIndex,
    showLyricsModal,
    togglePlay,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    closePlayer,
    toggleVocal,
    setVocalVolume,
    setVocalGender,
    setCurrentLyricIndex,
    setShowLyricsModal,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup Vocal Engine
  useEffect(() => {
    const engine = VocalEngine.getInstance();

    if (currentTrack?.lyrics) {
      engine.loadLyrics(currentTrack.lyrics, duration || currentTrack.duration || 120);
      setLyricsLines(engine.getLyrics());
    } else {
      engine.stop();
      setLyricsLines([]);
    }

    engine.setOptions({
      volume: vocalEnabled ? vocalVolume : 0,
      gender: vocalGender,
      onLineChange: (idx) => setCurrentLyricIndex(idx),
    });

    return () => {
      engine.stop();
    };
  }, [currentTrack?.id, currentTrack?.lyrics, duration, setCurrentLyricIndex]);

  // Update Vocal Engine options when settings change
  useEffect(() => {
    const engine = VocalEngine.getInstance();
    engine.setOptions({
      volume: vocalEnabled ? vocalVolume : 0,
      gender: vocalGender,
      onLineChange: (idx) => setCurrentLyricIndex(idx),
    });
  }, [vocalEnabled, vocalVolume, vocalGender, setCurrentLyricIndex]);

  // Sync play/pause with audio element and vocal engine
  useEffect(() => {
    const engine = VocalEngine.getInstance();
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (lastAudioUrlRef.current !== currentTrack.audioUrl) {
      lastAudioUrlRef.current = currentTrack.audioUrl;
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      if (currentTrack?.audioUrl) {
        console.log(`[MUSIC PLAYER]\nPlaying converted audio: ${currentTrack.audioUrl}`);
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name === "AbortError") {
            return;
          }
          console.warn("Autoplay blocked or playback error:", err);
          pause();
        });
      }
      engine.resume();
    } else {
      audio.pause();
      engine.pause();
    }
  }, [isPlaying, currentTrack?.id, currentTrack?.audioUrl, pause]);

  // Sync volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  if (!mounted || !currentTrack) return null;

  const hasLyrics = Boolean(
    (currentTrack.lyrics && currentTrack.lyrics.trim().length > 0) || currentTrack.hasVocals
  );

  const handleToggleVocal = () => {
    const nextState = !vocalEnabled;
    toggleVocal();
    const engine = VocalEngine.getInstance();
    engine.setOptions({ volume: nextState ? vocalVolume : 0 });
    if (!nextState) {
      engine.pause();
    } else if (audioRef.current) {
      engine.seekTo(audioRef.current.currentTime);
    }
  };

  const handleSwitchGender = () => {
    const nextGender = vocalGender === "female" ? "male" : "female";
    setVocalGender(nextGender);
    const engine = VocalEngine.getInstance();
    engine.setOptions({ gender: nextGender });
    if (audioRef.current) {
      engine.seekTo(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    VocalEngine.getInstance().seekTo(newTime);
  };

  const handleSeekToLine = (line: LyricLine) => {
    if (audioRef.current) {
      audioRef.current.currentTime = line.startTime;
      setCurrentTime(line.startTime);
      VocalEngine.getInstance().seekTo(line.startTime);
    }
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
    <>
      {/* Floating Karaoke / Lyrics Modal */}
      {showLyricsModal && hasLyrics && (
        <div className="fixed bottom-24 right-4 z-50 w-96 max-h-[480px] rounded-2xl border border-purple-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-purple-900/30 px-4 py-3 bg-purple-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Mic className="h-4 w-4 text-purple-400" />
              <span>Lời bài hát & Ca sĩ AI</span>
            </div>
            <button
              onClick={() => setShowLyricsModal(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Vocal controls inside Modal */}
          <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVocal}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  vocalEnabled
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                title="Bật/Tắt giọng hát ca sĩ AI"
              >
                {vocalEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                <span>{vocalEnabled ? "Giọng hát: BẬT" : "Chỉ nhạc cụ (TẮT)"}</span>
              </button>

              <button
                onClick={handleSwitchGender}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-purple-300 hover:border-purple-500 transition text-[11px] font-medium"
                title="Đổi ca sĩ AI hát (Nữ / Nam)"
              >
                {vocalGender === "female" ? "🌸 Giọng Nữ" : "🎙️ Giọng Nam"}
              </button>
            </div>
          </div>

          {/* Lyric lines list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-center text-xs">
            {lyricsLines.map((line, idx) => {
              const isActive = idx === currentLyricIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeekToLine(line)}
                  className={`p-2 rounded-xl cursor-pointer transition duration-200 ${
                    isActive
                      ? "bg-purple-600/30 border border-purple-500/50 text-white font-bold text-sm scale-105 shadow-lg shadow-purple-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  {line.section && idx === 0 && (
                    <span className="block text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1">
                      [{line.section}]
                    </span>
                  )}
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Global Audio Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-[#0d1322]/95 backdrop-blur-md px-4 py-3 shadow-2xl">
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          preload="auto"
          onCanPlay={() => {
            if (isPlaying && audioRef.current && audioRef.current.paused) {
              audioRef.current.play().catch(() => {});
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const time = audioRef.current.currentTime;
              setCurrentTime(time);
              VocalEngine.getInstance().updateTime(time, isPlaying);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || 0);
            }
          }}
          onEnded={() => {
            pause();
            VocalEngine.getInstance().stop();
          }}
        />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Track info */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md">
              {isPlaying ? (
                <Disc3 className="h-6 w-6 animate-spin text-purple-200" style={{ animationDuration: "3s" }} />
              ) : (
                <Music className="h-6 w-6 text-purple-200" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-slate-100">{currentTrack.title}</h4>
                {hasLyrics && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-medium text-purple-300 shrink-0">
                    <Mic className="h-3 w-3" />
                    <span>Có lời hát</span>
                  </span>
                )}
              </div>
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

          {/* Vocal Toggle, Volume & Actions */}
          <div className="flex items-center gap-3">
            {/* Lyrics / Vocal Button */}
            {hasLyrics && (
              <button
                onClick={() => setShowLyricsModal(!showLyricsModal)}
                className={`hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition ${
                  showLyricsModal
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/40"
                }`}
                title="Mở lời bài hát & Giọng hát AI"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Lời bài hát</span>
              </button>
            )}

            {/* Vocal Mute/Unmute quick toggle */}
            {hasLyrics && (
              <button
                onClick={handleToggleVocal}
                className={`p-2 rounded-lg text-xs transition ${
                  vocalEnabled
                    ? "text-purple-400 hover:bg-purple-500/10"
                    : "text-slate-500 hover:bg-slate-800"
                }`}
                title={vocalEnabled ? "Tắt giọng hát AI" : "Bật giọng hát AI"}
              >
                {vocalEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
            )}

            {/* Instrumental Volume */}
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
              onClick={() => {
                VocalEngine.getInstance().stop();
                closePlayer();
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
              title="Đóng thanh phát nhạc"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
