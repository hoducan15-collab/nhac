"use client";

import { useState } from "react";
import {
  Sparkles,
  Music2,
  Mic,
  Sliders,
  Play,
  Pause,
  Download,
  FolderPlus,
  Coins,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Disc3,
  Heart,
  Volume2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";

const GENRES = [
  "Pop / Ballad",
  "Lo-Fi Hip Hop",
  "Cinematic Orchestral",
  "EDM / Electronic",
  "Acoustic / Indie",
  "R&B / Neo Soul",
  "Synthwave / Cyberpunk",
  "Rock / Alternative",
  "Jazz / Blues",
  "Ambient / Chillout",
];

const MOODS = [
  "Thư giãn & Bình yên",
  "Năng động & Hào hứng",
  "Lãng mạn & Ngọt ngào",
  "U sầu & Hoài niệm",
  "Hùng tráng & Kịch tính",
  "Bí ẩn & Huyền bí",
];

const STYLES = [
  "Modern Studio Production",
  "Vintage 80s Analog",
  "Live Acoustic Unplugged",
  "Heavy Bass Electronic",
  "Minimalist Ambient Piano",
];

const INSTRUMENTS = [
  "Piano",
  "Acoustic Guitar",
  "Electric Guitar",
  "Synthesizer",
  "Violin / Cello",
  "Drums & Bass",
  "Saxophone",
];

interface GeneratedTrack {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  prompt: string;
  genre: string;
  mood: string;
  isInstrumental: boolean;
  versionName: string;
  createdAt: string;
}

export default function StudioPage() {
  const { user, updateCredits } = useAuthStore();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  // Form State
  const [projectTitle, setProjectTitle] = useState("Dự án mới #" + Math.floor(100 + Math.random() * 900));
  const [prompt, setPrompt] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(["Piano", "Acoustic Guitar"]);
  const [bpm, setBpm] = useState(120);
  const [durationSec, setDurationSec] = useState(120);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generated results
  const [results, setResults] = useState<GeneratedTrack[]>([
    {
      id: "gen-initial-1",
      title: "Khúc Hát Ban Mai (Demo v1)",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 140,
      prompt: "Giai điệu piano mượt mà kết hợp guitar acoustic đón ánh bình minh",
      genre: "Acoustic / Indie",
      mood: "Thư giãn & Bình yên",
      isInstrumental: true,
      versionName: "v1.0 • Chuẩn Studio",
      createdAt: "Vừa xong",
    },
  ]);

  const creditCost = isInstrumental ? 5 : 10;

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError("Vui lòng nhập mô tả ý tưởng hoặc phong cách bản nhạc bạn muốn tạo.");
      return;
    }

    if ((user?.creditsBalance ?? 0) < creditCost) {
      setError(`Bạn không đủ credit (cần ${creditCost} credits, hiện có ${user?.creditsBalance ?? 0}). Hãy nạp thêm.`);
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(5);
    setStatusMessage("Đang khởi tạo job và giữ chỗ credit...");

    // Simulated step-by-step generation pipeline (connecting to background worker / provider)
    setTimeout(() => {
      setProgress(25);
      setStatusMessage("Đang cấu trúc hòa âm và hòa thanh giai điệu...");
    }, 1200);

    setTimeout(() => {
      setProgress(55);
      setStatusMessage(isInstrumental ? "Đang tổng hợp nhạc cụ và master audio..." : "Đang xử lý vocal và đồng bộ lời hát...");
    }, 2800);

    setTimeout(() => {
      setProgress(85);
      setStatusMessage("Đang đóng gói file âm thanh chất lượng 320kbps...");
    }, 4500);

    setTimeout(() => {
      setProgress(100);
      setIsGenerating(false);

      // Deduct credit
      if (user) {
        updateCredits((user.creditsBalance || 0) - creditCost);
      }

      // Add new generated track
      const newTrack: GeneratedTrack = {
        id: "gen-" + Date.now(),
        title: `${projectTitle} (${genre})`,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: durationSec,
        prompt: prompt,
        genre: genre,
        mood: mood,
        isInstrumental: isInstrumental,
        versionName: `v${results.length + 1}.0`,
        createdAt: "Vừa xong",
      };

      setResults((prev) => [newTrack, ...prev]);
      playTrack({
        id: newTrack.id,
        title: newTrack.title,
        audioUrl: newTrack.audioUrl,
        duration: newTrack.duration,
        style: `${genre} • ${mood}`,
      });
    }, 6000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Music Generation Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Phòng Thu Sáng Tác AI</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Biến ý tưởng sáng tạo thành tác phẩm âm nhạc đa kênh với đầy đủ quyền kiểm soát.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-950/30 px-4 py-2 text-xs">
          <Coins className="h-4 w-4 text-purple-400" />
          <span className="text-slate-300">Chi phí dự kiến:</span>
          <span className="font-bold text-purple-300">{creditCost} Credits</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Studio Grid: Left Form Controls, Right Output & Versions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tên Dự án
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Nhập tên dự án..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Prompt input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Mô tả bài nhạc (Prompt)
                </label>
                <span className="text-[11px] text-slate-500">
                  {prompt.length}/500 ký tự
                </span>
              </div>
              <textarea
                rows={3}
                value={prompt}
                maxLength={500}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Một bản nhạc Lo-Fi ấm áp với tiếng piano chậm rãi, tiếng mưa rơi ngoài cửa sổ, bassline mượt mà mang lại cảm giác bình yên..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Mode: Instrumental vs With Lyrics */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsInstrumental(true)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border transition ${
                  isInstrumental
                    ? "border-purple-500 bg-purple-600/20 text-purple-200 shadow-sm"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Music2 className="h-4 w-4" />
                <span>Không lời (Instrumental)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInstrumental(false)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border transition ${
                  !isInstrumental
                    ? "border-purple-500 bg-purple-600/20 text-purple-200 shadow-sm"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Mic className="h-4 w-4" />
                <span>Có lời bài hát (Vocal)</span>
              </button>
            </div>

            {/* Lyrics textarea if with lyrics */}
            {!isInstrumental && (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-purple-300">
                    Lời bài hát (Lyrics)
                  </label>
                  <span className="text-[10px] text-purple-400/80">
                    Hỗ trợ [Verse], [Chorus], [Bridge]
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="[Verse 1]&#10;Từng giọt mưa rơi êm đềm bên hiên vắng...&#10;[Chorus]&#10;Để lại nỗi nhớ trong tim hoài không phai..."
                  className="w-full rounded-xl border border-purple-900/40 bg-slate-950/90 p-3 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            {/* Genre & Mood Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Thể loại âm nhạc
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g} className="bg-slate-900">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tâm trạng (Mood)
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m} className="bg-slate-900">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Style & Tempo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phong cách phối khí
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s} className="bg-slate-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Tempo: <span className="text-purple-400 font-bold">{bpm} BPM</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={60}
                  max={180}
                  step={1}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-800 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Instruments selection tags */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Nhạc cụ ưu tiên
              </label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map((inst) => {
                  const isSelected = selectedInstruments.includes(inst);
                  return (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => toggleInstrument(inst)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                        isSelected
                          ? "border-purple-500 bg-purple-600/20 text-purple-200"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {inst}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang hòa âm bản nhạc ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Tạo bản nhạc ({creditCost} Credits)</span>
                </>
              )}
            </button>
          </div>

          {/* Realtime progress tracker */}
          {isGenerating && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-300 flex items-center gap-2">
                  <Disc3 className="h-4 w-4 animate-spin text-purple-400" />
                  {statusMessage}
                </span>
                <span className="font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Output Panel: Versions & Playback (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Music2 className="h-5 w-5 text-purple-400" />
              Kết quả tạo nhạc ({results.length})
            </h3>
            <span className="text-xs text-slate-400">Định dạng MP3 320kbps</span>
          </div>

          <div className="space-y-3">
            {results.map((track) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() =>
                          playTrack({
                            id: track.id,
                            title: track.title,
                            audioUrl: track.audioUrl,
                            duration: track.duration,
                            style: `${track.genre} • ${track.mood}`,
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm truncate">{track.title}</h4>
                          <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/20">
                            {track.versionName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{track.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={track.audioUrl}
                        download={`${track.title}.mp3`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        title="Tải bài hát"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    &ldquo;{track.prompt}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>{track.mood}</span>
                    <span>{track.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
