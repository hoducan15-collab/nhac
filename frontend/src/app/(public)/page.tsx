"use client";

import Link from "next/link";
import {
  Sparkles,
  Music,
  Disc3,
  Sliders,
  Play,
  Volume2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Zap,
  ShieldCheck,
  Headphones,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";

// Sample demonstration tracks for user to listen right on the landing page
const DEMO_TRACKS = [
  {
    id: "demo-1",
    title: "Neon Horizon Waves",
    genre: "Synthwave / Cyberpunk",
    duration: 142,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    bpm: 124,
    mood: "Năng động & Huyền ảo",
  },
  {
    id: "demo-2",
    title: "Midnight Rain Reflections",
    genre: "Lo-Fi Hip Hop",
    duration: 185,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    bpm: 85,
    mood: "Thư giãn & Hoài niệm",
  },
  {
    id: "demo-3",
    title: "Celestial Odyssey",
    genre: "Cinematic Orchestral",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    bpm: 110,
    mood: "Hùng tráng & Sử thi",
  },
  {
    id: "demo-4",
    title: "Acoustic Sunsets in Da Lat",
    genre: "Acoustic Pop / Indie",
    duration: 160,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    bpm: 96,
    mood: "Mộc mạc & Ấm áp",
  },
];

const GENRES = [
  { name: "Pop & Ballad", desc: "Giai điệu bắt tai, ca từ giàu cảm xúc, hòa âm hiện đại" },
  { name: "Lo-Fi Beats", desc: "Âm hưởng êm dịu, ấm áp, hoàn hảo cho học tập và thư giãn" },
  { name: "Cinematic / Epic", desc: "Hòa thanh giao hưởng kịch tính cho phim ảnh, game và trailer" },
  { name: "EDM & House", desc: "Bassline cuốn hút, năng lượng bùng nổ cho sàn diễn" },
  { name: "R&B / Soul", desc: "Rhythm mượt mà, chiều sâu giọng hát và hòa âm da diết" },
  { name: "Acoustic / Folk", desc: "Guitar mộc, piano tinh tế, truyền tải tự sự chân thật" },
  { name: "Cyberpunk / Synth", desc: "Âm thanh điện tử tương lai, synthesizer hoài cổ thập niên 80" },
  { name: "Rock & Alternative", desc: "Guitar điện sống động, trống mạnh mẽ, giàu năng lượng" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Mô tả ý tưởng hoặc dán lời bài hát",
    desc: "Nhập thể loại, tâm trạng, nhạc cụ hoặc cung cấp lời nhạc bạn tự sáng tác.",
  },
  {
    step: "02",
    title: "AI hòa âm & sinh giai điệu",
    desc: "Hệ thống AI xử lý cấu trúc bài hát, bassline, hòa âm và giọng hát theo yêu cầu.",
  },
  {
    step: "03",
    title: "Nghe thử, tinh chỉnh & xuất bản",
    desc: "Thưởng thức bản nhạc trực tiếp trên web player, tải file âm thanh chất lượng cao về máy.",
  },
];

const FAQS = [
  {
    q: "Tôi có sở hữu bản quyền nhạc do AI tạo ra không?",
    a: "Có, các bản nhạc bạn tạo từ gói cước Pro hoặc trả phí đều có quyền thương mại đầy đủ để bạn phát hành trên Spotify, YouTube, TikTok hoặc sử dụng cho phim/game.",
  },
  {
    q: "Hệ thống hỗ trợ tạo nhạc có lời tiếng Việt không?",
    a: "Hệ thống hỗ trợ nhập lời bài hát tiếng Việt hoặc tiếng Anh, bạn có thể tự viết từng đoạn verse, chorus và bridge.",
  },
  {
    q: "Credit hoạt động như thế nào?",
    a: "Mỗi lượt tạo nhạc (khoảng 2 phiên bản khác nhau) sẽ trừ một lượng credit nhỏ. Bạn có thể nạp thêm gói credit linh hoạt bất cứ lúc nào.",
  },
  {
    q: "Nếu AI tạo thất bại thì có bị trừ credit không?",
    a: "Không. Hệ thống áp dụng cơ chế giữ chỗ và hoàn trả 100% credit ngay lập tức nếu tác vụ gặp sự cố kỹ thuật.",
  },
];

export default function LandingPage() {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-medium text-purple-300 shadow-inner mb-8">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Thế hệ AI Music Studio tiên tiến 2026</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Biến ngôn từ thành{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            kiệt tác âm nhạc
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
          Tạo bản nhạc hoàn chỉnh từ mô tả văn bản. Hòa âm chuyên nghiệp, lời hát tự động, đa dạng thể loại từ Ballad, Lofi đến EDM & Cinematic chỉ trong vài giây.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            <span>Bắt đầu sáng tác miễn phí</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-base font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600"
          >
            <span>Xem bảng giá & gói Pro</span>
          </Link>
        </div>

        {/* Hero Features Highlights */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-xs text-slate-400 mt-1">Thể loại âm nhạc</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">Có lời / Không lời</div>
            <div className="text-xs text-slate-400 mt-1">Tự do kiểm soát vocal</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
            <div className="text-2xl font-bold text-white">320kbps</div>
            <div className="text-xs text-slate-400 mt-1">Chất lượng âm thanh Studio</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">100% Bản quyền</div>
            <div className="text-xs text-slate-400 mt-1">Sử dụng thương mại</div>
          </div>
        </div>
      </section>

      {/* Demo Tracks Showcase with Interactive Player */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Nghe thử tác phẩm được tạo bởi AI
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Bấm nút phát để trải nghiệm chất lượng hòa âm, tempo và âm sắc sống động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_TRACKS.map((track) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-purple-500/40 hover:bg-slate-900/90"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() =>
                      playTrack({
                        id: track.id,
                        title: track.title,
                        audioUrl: track.audioUrl,
                        duration: track.duration,
                        style: track.genre,
                      })
                    }
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                      isCurrentPlaying
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-800 text-slate-200 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {isCurrentPlaying ? (
                      <Disc3 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{track.title}</h3>
                    <p className="text-xs text-purple-400 mt-0.5">{track.genre}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span>{track.mood}</span>
                      <span>•</span>
                      <span>{track.bpm} BPM</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/studio"
                  className="shrink-0 text-xs text-slate-400 hover:text-purple-300 font-medium ml-2"
                >
                  Tạo tương tự →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Công nghệ phòng thu AI toàn diện
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Từ ý tưởng ban đầu đến bài hát hoàn chỉnh, mọi công cụ sáng tạo đều nằm trong tầm tay của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-purple-500/30 transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-5">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Prompt to Music</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mô tả cảm xúc hoặc cảnh phim bạn muốn thể hiện, AI sẽ phân tích và tạo nên bản phối hoàn hảo đúng tông giọng và giai điệu mong đợi.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-purple-500/30 transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-5">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Kiểm soát tham số tinh tế</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tùy chỉnh thể loại, tâm trạng, phong cách hòa âm, nhạc cụ chủ đạo và nhịp điệu (BPM) linh hoạt theo ý muốn của nhà sản xuất.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-purple-500/30 transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 mb-5">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quản lý phiên bản & Playlist</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Lưu trữ mọi phiên bản biến tấu trong từng dự án, sắp xếp playlist và phân loại thư viện bài hát cá nhân một cách ngăn nắp.
            </p>
          </div>
        </div>
      </section>

      {/* Genres Grid */}
      <section id="genres" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Đa dạng phong cách & thể loại
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Sẵn sàng đáp ứng từ các bản hit radio đến nhạc nền thương mại chuyên nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GENRES.map((g, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 transition hover:border-purple-500/40 hover:bg-slate-900/80"
            >
              <h4 className="font-semibold text-white text-sm">{g.name}</h4>
              <p className="mt-1 text-xs text-slate-400 leading-normal">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Sáng tác chỉ với 3 bước đơn giản
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="text-3xl font-extrabold text-purple-500/40 mb-3">{step.step}</div>
              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Câu hỏi thường gặp
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Giải đáp các thắc mắc về sáng tác, bản quyền và chính sách sử dụng.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-400 shrink-0" />
                {faq.q}
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Sẵn sàng tạo ra bản hit đầu tiên của bạn?
            </h2>
            <p className="mt-4 text-sm text-slate-300">
              Gia nhập cùng hàng ngàn nhạc sĩ, nhà sản xuất nội dung và người yêu âm nhạc ngay hôm nay.
            </p>
            <div className="mt-8">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02]"
              >
                <Sparkles className="h-5 w-5" />
                <span>Mở AI Music Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
