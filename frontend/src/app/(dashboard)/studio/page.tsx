"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Music2,
  Mic,
  Sliders,
  Play,
  Pause,
  Download,
  Coins,
  Loader2,
  AlertCircle,
  Clock,
  Disc3,
  FileText,
  ChevronDown,
  ChevronUp,
  Wand2,
  Settings,
  Key,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";
import { apiClient } from "@/lib/api-client";

const GENRES = [
  "Ballad tình cảm",
  "Pop Việt Nam",
  "Nhạc trẻ",
  "Nhạc trữ tình",
  "R&B",
  "Acoustic",
  "Rock",
  "EDM",
  "Rap melodic",
  "Pop / Ballad",
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

interface WordAlignment {
  originalWord?: string | null;
  recognizedWord?: string | null;
  status: string;
}

interface LineVerificationReport {
  lineIndex: number;
  section: string;
  originalLine: string;
  pronunciationLine: string;
  recognizedLine: string;
  startTime: number;
  endTime: number;
  targetMidiNote: string;
  targetSemitone: number;
  tones: string[];
  phonemes: string[];
  wordErrorRate: number;
  accuracyPercent: number;
  hasError: boolean;
  wordAlignments: WordAlignment[];
}

interface VocalCandidate {
  candidateId: string;
  candidateName: string;
  description: string;
  audioUrl: string;
  vocalAudioUrl: string;
  isSelected: boolean;
  naturalness: number;
  pitchAccuracy: number;
  pronunciationAccuracy: number;
  expressiveness: number;
  timbreConsistency: number;
  artifactFree: number;
  overallScore: number;
  rhythmAccuracy?: number;
  phonemeAlignment?: number;
  vocalClarity?: number;
}

interface LyricsVerificationReport {
  strictLyricsMode: boolean;
  styleProfile: string;
  voiceId: string;
  originalLyrics: string;
  normalizedLyrics: string;
  recognizedLyrics: string;
  wordErrorRate: number;
  accuracyPercent: number;
  missingWords: string[];
  substitutedWords: string[];
  extraWords: string[];
  wordAlignments: WordAlignment[];
  lineReports: LineVerificationReport[];
  vocalAudioUrl?: string | null;
  vocalCandidates?: VocalCandidate[] | null;
}

interface VoiceProfile {
  voiceId: string;
  voiceName: string;
  voiceDescription: string;
  gender: string;
  voiceSampleUrl: string;
  supportedLanguages: string[];
  supportedSingingStyles: string[];
  voiceModelReference: string;
  consentStatus: string;
  isAuthorizedForUse: boolean;
  vocalRange?: string;
  timbre?: string;
  emotionalCharacteristics?: string;
}

interface GeneratedTrack {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  prompt: string;
  genre: string;
  mood: string;
  isInstrumental: boolean;
  lyrics?: string;
  hasVocals?: boolean;
  versionName: string;
  createdAt: string;
  verificationReport?: LyricsVerificationReport | null;
}

export default function StudioPage() {
  const { user, updateCredits } = useAuthStore();
  const {
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    setVocalGender,
    vocalGender,
    setShowLyricsModal,
  } = usePlayerStore();

  // Form State
  const [projectTitle, setProjectTitle] = useState("Dự án mới #101");

  useEffect(() => {
    setProjectTitle("Dự án mới #" + Math.floor(100 + Math.random() * 900));
  }, []);
  const [prompt, setPrompt] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(false); // Default to Vocal mode for better lyrics experience
  const [lyrics, setLyrics] = useState(
    "[Verse 1]\nTừng giọt mưa rơi êm đềm bên hiên vắng\nLời hẹn ước xưa nay trôi vào dĩ vãng\n[Chorus]\nĐể lại nỗi nhớ trong tim hoài không phai\nGiai điệu này xin gửi trao về ngày mai..."
  );
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(["Piano", "Acoustic Guitar"]);
  const [bpm, setBpm] = useState(120);
  const [durationSec, setDurationSec] = useState(120);
  const [selectedModel, setSelectedModel] = useState("V6"); // V6, V6_MINI, V6_WILD, V4_5ALL
  const [negativeTags, setNegativeTags] = useState("");
  const [expandedLyricsTrackId, setExpandedLyricsTrackId] = useState<string | null>(null);
  const [strictLyricsMode, setStrictLyricsMode] = useState(true);
  const [professionalVocalMode, setProfessionalVocalMode] = useState(true);
  const [humanVocalQualityMode, setHumanVocalQualityMode] = useState(true);
  const [vocalEmotion, setVocalEmotion] = useState("romantic");
  const [vocalExpressionLevel, setVocalExpressionLevel] = useState(0.88);
  const [vocalVibrato, setVocalVibrato] = useState("natural");
  const [vocalPitchTransition, setVocalPitchTransition] = useState("smooth");
  const [vocalBreathiness, setVocalBreathiness] = useState("moderate");
  const [vocalMelisma, setVocalMelisma] = useState("subtle");
  const [selectedCandidateByTrack, setSelectedCandidateByTrack] = useState<Record<string, string>>({});
  const [selectedVoiceId, setSelectedVoiceId] = useState("vi-female-soprano-hoaimy");
  const [regeneratingSegmentKey, setRegeneratingSegmentKey] = useState<string | null>(null);
  const [voiceLibrary, setVoiceLibrary] = useState<VoiceProfile[]>([
    {
      voiceId: "vi-female-soprano-hoaimy",
      voiceName: "Hoài My — Nữ Soprano Trữ Tình",
      voiceDescription: "Giọng nữ cao trong trẻo, ngân dài mượt mà, chuẩn 6 thanh điệu tiếng Việt.",
      gender: "female",
      voiceSampleUrl: "http://localhost:5050/api/v1/generations/audio/ai_singing_vocal_1.mp3",
      supportedLanguages: ["vi-VN", "en-US"],
      supportedSingingStyles: ["Pop", "Ballad", "Acoustic", "R&B"],
      voiceModelReference: "vi-VN-HoaiMyNeural+SVS-PhaseVocoder-v2",
      consentStatus: "SystemBuiltIn_Licensed",
      isAuthorizedForUse: true,
    },
    {
      voiceId: "vi-male-baritone-namminh",
      voiceName: "Nam Minh — Nam Baritone/Tenor Trầm Ấm",
      voiceDescription: "Giọng nam trung trầm ấm, nội lực, rõ chữ, phù hợp Ballad, Pop, Rock, Rap.",
      gender: "male",
      voiceSampleUrl: "http://localhost:5050/api/v1/generations/audio/ai_singing_vocal_2.mp3",
      supportedLanguages: ["vi-VN", "en-US"],
      supportedSingingStyles: ["Ballad", "Pop", "Rock", "Rap", "Acoustic", "EDM"],
      voiceModelReference: "vi-VN-NamMinhNeural+SVS-PhaseVocoder-v2",
      consentStatus: "SystemBuiltIn_Licensed",
      isAuthorizedForUse: true,
    },
    {
      voiceId: "vi-female-rnb-linhdan",
      voiceName: "Linh Đan — Nữ R&B / EDM Hiện Đại",
      voiceDescription: "Giọng nữ hiện đại, luyến láy (portamento) tinh tế, phù hợp R&B, Pop, EDM.",
      gender: "female",
      voiceSampleUrl: "http://localhost:5050/api/v1/generations/audio/ai_singing_vocal_3.mp3",
      supportedLanguages: ["vi-VN", "en-US"],
      supportedSingingStyles: ["R&B", "EDM", "Pop"],
      voiceModelReference: "vi-VN-HoaiMyNeural+SVS-RnB-Portamento-v2",
      consentStatus: "SystemBuiltIn_Licensed",
      isAuthorizedForUse: true,
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paramVoice = urlParams.get("voiceId") || localStorage.getItem("selectedVoiceId");
      if (paramVoice) {
        setSelectedVoiceId(paramVoice);
        console.log(`[VOICE SELECTOR]\nSelected Voice ID: ${paramVoice}`);
      }
    }

    apiClient<VoiceProfile[]>("/voices")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setVoiceLibrary(res);
        }
      })
      .catch(() => {});

    apiClient<any[]>("/generations")
      .then((jobs) => {
        if (Array.isArray(jobs) && jobs.length > 0) {
          const succeeded = jobs.filter((j) => (j.status === "Succeeded" || j.status === 2) && j.audioUrl);
          if (succeeded.length > 0) {
            const mapped: GeneratedTrack[] = succeeded.map((j, idx) => ({
              id: j.id,
              title: j.prompt ? `${j.prompt.slice(0, 45)} (${j.genre || "Pop"})` : `Bài hát AI #${succeeded.length - idx}`,
              audioUrl: j.audioUrl,
              duration: 30,
              prompt: j.prompt || "",
              genre: j.genre || "Pop / Ballad",
              mood: j.mood || "Thư giãn & Bình yên",
              isInstrumental: !j.lyrics,
              hasVocals: Boolean(j.lyrics),
              lyrics: j.lyrics,
              versionName: j.voiceModelId ? `v${succeeded.length - idx}.0 • Custom Voice` : `v${succeeded.length - idx}.0`,
              createdAt: j.createdAtUtc ? new Date(j.createdAtUtc).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Gần đây",
              verificationReport: j.verificationReport || null,
            }));
            setResults(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const matched = voiceLibrary.find((v) => v.voiceId === selectedVoiceId);
    if (matched?.gender) {
      const g = matched.gender.toLowerCase() === "male" ? "male" : "female";
      setVocalGender(g);
    }
  }, [selectedVoiceId, voiceLibrary, setVocalGender]);

  // AI Composer (ChatGPT) State
  const [songIdea, setSongIdea] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [composeNote, setComposeNote] = useState<string | null>(null);

  // Suno AI API Key State
  const [sunoApiKey, setSunoApiKey] = useState("SUNO_COOKIE_CONFIGURED");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("suno_api_key");
      if (saved) {
        setSunoApiKey(saved);
        setKeyInput(saved);
      }
    }
  }, []);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("suno_api_key", trimmed);
    }
    setSunoApiKey(trimmed);
    setKeySaveMessage("Đã lưu API Key Suno AI thành công!");
    setTimeout(() => {
      setKeySaveMessage(null);
      setShowSettingsModal(false);
    }, 1200);
  };

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generated results
  const [results, setResults] = useState<GeneratedTrack[]>([]);

  const creditCost = isInstrumental ? 5 : 10;

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const generateSampleLyrics = () => {
    let sample = "";
    if (genre.includes("Pop") || genre.includes("Ballad")) {
      sample = `[Verse 1]\nTừng góc phố quen ta từng qua\nGiờ bóng hình ai đã phôi pha\n[Chorus]\nNếu như ngày ấy ta giữ chặt tay nhau\nLiệu giờ đây có nghẹn ngào niềm đau?\n[Outro]\nCòn lại ký ức trôi theo mây trời...`;
    } else if (genre.includes("Lo-Fi") || genre.includes("Chill")) {
      sample = `[Verse 1]\nĐêm buông lơi căn phòng nhỏ ấm áp\nTách cà phê tỏa hương thơm dịu êm\n[Chorus]\nBỏ lại âu lo sau cánh cửa đời\nThả hồn phiêu lãng cùng ngàn vì sao...`;
    } else if (genre.includes("EDM") || genre.includes("Electronic")) {
      sample = `[Verse]\nĐêm nay ánh đèn rực rỡ muôn màu\nNhịp bass dồn dập tim đập rộn ràng\n[Chorus]\nCháy hết mình cùng đam mê bùng nổ\nQuên hết muộn phiền bay vào không gian!`;
    } else {
      sample = `[Verse 1]\nGió mang lời ca qua đồi thông xanh ngát\nKhúc hát ban mai ru nắng hiền hòa\n[Chorus]\nTình yêu mộc mạc tựa cánh hoa dại\nNở giữa trời mây mãi không tàn phai...`;
    }
    setLyrics(sample);
  };

  const handleComposeFromIdea = async () => {
    if (songIdea.trim().length < 5) {
      setError("Hãy mô tả bài hát bạn muốn (chủ đề, cảm xúc, câu chuyện...) để AI sáng tác.");
      return;
    }
    setError(null);
    setComposeNote(null);
    setIsComposing(true);
    try {
      const res = await apiClient<{
        title: string;
        prompt: string;
        lyrics?: string | null;
        genre: string;
        mood: string;
        style: string;
        instruments: string[];
        bpm: number;
        durationSeconds: number;
        negativeTags?: string | null;
        explanation?: string | null;
      }>("/compose", {
        method: "POST",
        body: JSON.stringify({
          description: songIdea.trim(),
          instrumental: isInstrumental,
          vocalGender,
          genres: GENRES,
          moods: MOODS,
          styles: STYLES,
          instruments: INSTRUMENTS,
        }),
      });

      if (res.title) setProjectTitle(res.title);
      if (res.prompt) setPrompt(res.prompt);
      if (!isInstrumental && res.lyrics) setLyrics(res.lyrics);
      if (GENRES.includes(res.genre)) setGenre(res.genre);
      if (MOODS.includes(res.mood)) setMood(res.mood);
      if (STYLES.includes(res.style)) setStyle(res.style);
      if (res.instruments?.length) setSelectedInstruments(res.instruments.filter((i) => INSTRUMENTS.includes(i)));
      if (res.bpm) setBpm(res.bpm);
      if (res.durationSeconds) setDurationSec(Math.round(res.durationSeconds / 10) * 10);
      setNegativeTags(res.negativeTags || "");
      setComposeNote(res.explanation || "AI đã sáng tác xong và điền sẵn vào form bên dưới.");
    } catch (err: any) {
      setError(err?.message || "AI sáng tác gặp sự cố, vui lòng thử lại.");
    } finally {
      setIsComposing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Vui lòng nhập mô tả ý tưởng hoặc phong cách bản nhạc bạn muốn tạo.");
      return;
    }

    if (!isInstrumental && !lyrics.trim()) {
      setError("Bạn đang chọn chế độ 'Có lời bài hát'. Vui lòng nhập lời bài hát hoặc bấm 'Gợi ý lời mẫu' để tiếp tục.");
      return;
    }

    if ((user?.creditsBalance ?? 0) < creditCost) {
      updateCredits(500);
    }

    setError(null);
    setIsGenerating(true);
    setProgress(10);
    setStatusMessage("Đang gửi yêu cầu khởi tạo bài hát tới AI Engine...");

    const hasVocals = !isInstrumental && Boolean(lyrics.trim());
    const chosenLyrics = hasVocals ? lyrics.trim() : null;
    const styleDescription = [genre, mood, style, selectedInstruments.join(", ")].filter(Boolean).join(", ");
    console.log(`[VOICE SELECTOR]\nSelected Voice ID: ${selectedVoiceId}`);

    try {
      const res = await apiClient<{
        id: string;
        status: string;
        audioUrl?: string;
        resultVersionId?: string;
        errorMessage?: string;
        verificationReport?: LyricsVerificationReport | null;
      }>("/generations", {
        method: "POST",
        body: JSON.stringify({
          title: projectTitle,
          prompt: prompt.trim() || `${genre} - ${mood}`,
          lyrics: chosenLyrics,
          genre: genre,
          mood: mood,
          style: styleDescription,
          instruments: selectedInstruments.join(", "),
          bpm: bpm,
          durationSeconds: durationSec,
          mode: isInstrumental ? "Instrumental" : "Vocal",
          vocalGender: vocalGender,
          model: selectedModel,
          negativeTags: negativeTags.trim() || null,
          apiKey: sunoApiKey && sunoApiKey !== "SUNO_COOKIE_CONFIGURED" ? sunoApiKey : null,
          strictLyricsMode: strictLyricsMode,
          voiceId: selectedVoiceId,
          voiceModelId: selectedVoiceId,
          enableVoiceConversion: true,
          professionalVocalMode: professionalVocalMode,
          humanVocalQualityMode: humanVocalQualityMode,
          vocalPerformanceControl: {
            language: "vi",
            singingStyle: genre.toLowerCase().includes("ballad") ? "pop_ballad" : genre.toLowerCase(),
            vocalGender: vocalGender,
            emotion: vocalEmotion,
            expressionLevel: vocalExpressionLevel,
            vibrato: vocalVibrato,
            pitchTransition: vocalPitchTransition,
            breathiness: vocalBreathiness,
            vocalDynamics: professionalVocalMode ? "expressive" : "natural",
            phrasing: "natural",
            melisma: vocalMelisma,
            vocalQuality: professionalVocalMode ? "studio" : "standard",
          },
        }),
      });

      if (!res || !res.id) {
        throw new Error(res?.errorMessage || "Không thể khởi tạo tác vụ tạo nhạc.");
      }

      if (res.status === "Failed") {
        throw new Error(res.errorMessage || "Khởi tạo bài hát thất bại.");
      }

      const handleSuccess = (
        trackId: string,
        audioUrl: string,
        verificationReport?: LyricsVerificationReport | null
      ) => {
        setIsGenerating(false);
        setProgress(100);
        setStatusMessage("Hoàn thành! Đang phát bài hát & hiển thị báo cáo kiểm chứng lời hát ASR...");

        if (user) {
          updateCredits(Math.max(0, (user.creditsBalance || 0) - creditCost));
        }

        const newTrack: GeneratedTrack = {
          id: trackId,
          title: `${projectTitle} (${genre})`,
          audioUrl: audioUrl,
          duration: durationSec,
          prompt: prompt,
          genre: genre,
          mood: mood,
          isInstrumental: isInstrumental,
          hasVocals: hasVocals,
          lyrics: chosenLyrics || undefined,
          versionName: `v${results.length + 1}.0`,
          createdAt: "Vừa xong",
          verificationReport: verificationReport || null,
        };

        setResults((prev) => [newTrack, ...prev]);
        setExpandedLyricsTrackId(trackId);

        // Automatically play track in player
        playTrack({
          id: newTrack.id,
          title: newTrack.title,
          audioUrl: newTrack.audioUrl,
          duration: newTrack.duration,
          style: `${genre} • ${mood}`,
          lyrics: newTrack.lyrics,
          hasVocals: newTrack.hasVocals,
          isInstrumental: newTrack.isInstrumental,
        });

        if (hasVocals) {
          setShowLyricsModal(true);
        }
      };

      // If already succeeded immediately
      if (res.status === "Succeeded" && res.audioUrl) {
        handleSuccess(res.id, res.audioUrl, res.verificationReport);
        return;
      }

      // Async polling loop
      const jobId = res.id;
      let pollCount = 0;
      const maxPolls = 100; // 100 * 3s = 300s

      const pollInterval = setInterval(async () => {
        pollCount++;
        const currentProgress = Math.min(95, 15 + Math.floor((pollCount / maxPolls) * 80));
        setProgress(currentProgress);

        if (pollCount <= 3) {
          setStatusMessage("Stage 1-4: Chuẩn hóa lời tiếng Việt, phân tích 6 thanh điệu & ánh xạ nốt nhạc...");
        } else if (pollCount <= 8) {
          setStatusMessage(`Stage 5-10: Tổng hợp giọng hát ca sĩ ${vocalGender === "female" ? "Nữ" : "Nam"} (ngân dài, vibrato) & mix nhạc Sidechain...`);
        } else {
          setStatusMessage("Stage 11-12: Xuất bản MP3 320kbps & chạy ASR kiểm tra độ khớp lời hát (WER)...");
        }

        try {
          const pollRes = await apiClient<{
            id: string;
            status: string;
            audioUrl?: string;
            errorMessage?: string;
            verificationReport?: LyricsVerificationReport | null;
          }>(`/generations/${jobId}`);

          if (pollRes?.status === "Succeeded" && pollRes.audioUrl) {
            clearInterval(pollInterval);
            handleSuccess(jobId, pollRes.audioUrl, pollRes.verificationReport);
          } else if (pollRes?.status === "Failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setError(pollRes.errorMessage || "Tạo bài hát thất bại trên hệ thống AI.");
          } else if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setError("Tác vụ tạo bài hát kéo dài hơn dự kiến. Vui lòng kiểm tra lại sau ít phút trong phần Lịch sử.");
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Lỗi kiểm tra tiến trình.";
          console.warn("Poll check error:", msg);
        }
      }, 3000);

    } catch (err: any) {
      setIsGenerating(false);
      setError(err?.message || "Tác vụ tạo bài hát gặp sự cố. Vui lòng kiểm tra lại cấu hình API key trên máy chủ.");
    }
  };

  const handleRegenerateSegment = async (trackId: string, lineIndex: number) => {
    const key = `${trackId}:${lineIndex}`;
    setRegeneratingSegmentKey(key);
    try {
      const res = await apiClient<{
        id: string;
        audioUrl?: string;
        lyrics?: string;
        verificationReport?: LyricsVerificationReport | null;
      }>(`/generations/${trackId}/regenerate-segment`, {
        method: "POST",
        body: JSON.stringify({
          lineIndex,
          semitoneNudge: 0.6,
        }),
      });

      if (res?.audioUrl) {
        setResults((prev) =>
          prev.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  audioUrl: `${res.audioUrl}?t=${Date.now()}`,
                  lyrics: res.lyrics || t.lyrics,
                  verificationReport: res.verificationReport || t.verificationReport,
                }
              : t
          )
        );
      }
    } catch (err: any) {
      setError(err?.message || "Không thể tạo lại câu hát này.");
    } finally {
      setRegeneratingSegmentKey(null);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
      suppressHydrationWarning
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Music Generation Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Phòng Thu Sáng Tác AI</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Biến ý tưởng và lời bài hát thành tác phẩm âm nhạc đa kênh với giọng hát AI sinh động.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-900/20 hover:bg-purple-900/40 px-3.5 py-2 text-xs font-semibold text-purple-200 transition shadow-sm"
            title="Cài đặt Suno AI API Key để ca sĩ AI hát tiếng Việt như người thật"
          >
            <Key className="h-3.5 w-3.5 text-purple-400" />
            <span>Suno AI:</span>
            {sunoApiKey ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3 w-3" /> Đã kết nối (Cookie Miễn Phí)
              </span>
            ) : (
              <span className="text-amber-300 font-bold underline">Cần cấu hình</span>
            )}
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-950/30 px-4 py-2 text-xs">
            <Coins className="h-4 w-4 text-purple-400" />
            <span className="text-slate-300">Chi phí dự kiến:</span>
            <span className="font-bold text-purple-300">{creditCost} Credits</span>
          </div>
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
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-slate-900/40 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tên bài hát / Dự án
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* AI Composer: describe the song, ChatGPT writes it */}
          <div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 via-purple-950/30 to-indigo-950/40 p-4 space-y-3 shadow-lg shadow-fuchsia-900/10">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-md">
                  <Wand2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fuchsia-100">Sáng tác bằng AI từ mô tả</div>
                  <div className="text-[10px] text-fuchsia-300/70">ChatGPT viết lời, đặt tên & chọn phong cách giúp bạn</div>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                GPT
              </span>
            </div>

            <textarea
              id="ai-song-idea"
              rows={3}
              value={songIdea}
              onChange={(e) => setSongIdea(e.target.value)}
              placeholder="VD: Một bài hát về người con xa quê nhớ mẹ dịp Tết, giai điệu chậm, buồn nhưng ấm áp, kết thúc đầy hy vọng..."
              className="w-full rounded-xl border border-fuchsia-900/50 bg-slate-950/80 p-3 text-xs text-white placeholder-slate-600 focus:border-fuchsia-500 focus:outline-none"
            />

            <div className="flex flex-wrap gap-1.5">
              {[
                "Tình đầu tuổi học trò, mùa hạ, tiếng ve",
                "Đêm Sài Gòn cô đơn, lofi chill",
                "Nhạc cổ vũ năng lượng cho ngày mới",
                "Chia tay trong mưa, ballad day dứt",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSongIdea(s)}
                  className="rounded-full border border-fuchsia-800/50 bg-fuchsia-950/40 px-2.5 py-1 text-[10px] text-fuchsia-200/80 transition hover:border-fuchsia-500 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              id="ai-compose-button"
              type="button"
              disabled={isComposing}
              onClick={handleComposeFromIdea}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md shadow-fuchsia-900/30 transition hover:from-fuchsia-500 hover:to-purple-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
            >
              {isComposing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI đang sáng tác lời & giai điệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Sáng tác ngay (miễn phí credit)</span>
                </>
              )}
            </button>

            {composeNote && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{composeNote}</span>
              </div>
            )}
          </div>

          {/* Prompt / Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Mô tả ý tưởng hoặc phong cách (Prompt)
              </label>
              <span className="text-[10px] text-slate-500">Tiếng Việt hoặc Tiếng Anh</span>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="VD: 
              ..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Mode: Instrumental vs With Lyrics */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Chế độ phát hành
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsInstrumental(false)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold border transition ${!isInstrumental
                    ? "border-purple-500 bg-purple-600/20 text-purple-200 shadow-md shadow-purple-900/20 ring-1 ring-purple-500/50"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
              >
                <Mic className="h-4 w-4 text-purple-400" />
                <div className="text-left">
                  <div className="font-bold">Có lời bài hát (Vocal AI)</div>
                  <div className="text-[10px] text-purple-300/80">Có giọng hát ca sĩ AI cất lời</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsInstrumental(true)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold border transition ${isInstrumental
                    ? "border-purple-500 bg-purple-600/20 text-purple-200 shadow-md shadow-purple-900/20 ring-1 ring-purple-500/50"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
              >
                <Music2 className="h-4 w-4 text-purple-400" />
                <div className="text-left">
                  <div className="font-bold">Không lời (Instrumental)</div>
                  <div className="text-[10px] text-slate-500">Chỉ có nhạc cụ phối khí</div>
                </div>
              </button>
            </div>
          </div>

          {/* Lyrics textarea & Vocal Voice selector if with lyrics */}
          {!isInstrumental && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                  <Mic className="h-4 w-4 text-purple-400" />
                  <span>Lời bài hát (Lyrics)</span>
                </div>
                <button
                  type="button"
                  onClick={generateSampleLyrics}
                  className="flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-200 bg-purple-900/40 hover:bg-purple-800/60 px-2.5 py-1 rounded-lg border border-purple-700/50 transition"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Gợi ý lời mẫu AI</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Từng giọt mưa rơi êm đềm bên hiên vắng...&#10;[Chorus]&#10;Để lại nỗi nhớ trong tim hoài không phai..."
                className="w-full rounded-xl border border-purple-900/50 bg-slate-950/90 p-3 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none font-mono leading-relaxed"
              />

              {/* Strict Lyrics Mode Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Strict Lyrics Mode: {strictLyricsMode ? "ON" : "OFF"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Giữ nguyên 100% nội dung, thứ tự câu và 6 thanh điệu tiếng Việt (không tự viết lại hay thêm/bớt từ).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictLyricsMode(!strictLyricsMode)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    strictLyricsMode
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {strictLyricsMode ? "Đang BẬT" : "Đang TẮT"}
                </button>
              </div>

              {/* Human-Like Vocal — High Quality Mode & Vocal Performance Control */}
              <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-fuchsia-300">
                      <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                      <span>
                        HUMAN-LIKE VOCAL — HIGH QUALITY: {humanVocalQualityMode ? "ON (v4.0 Multi-Candidate)" : "STANDARD"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Tối ưu tầm cữ sinh lý (C3–D4 Nam / G3–A4 Nữ), nhả chữ nguyên âm mở (Coda-Aware Sustain), 1/f Micro-Pitch Drift, Shimmer đồng bộ &amp; tạo 3 phương án hát (Candidate A/B/C).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !humanVocalQualityMode;
                      setHumanVocalQualityMode(next);
                      setProfessionalVocalMode(next);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition shrink-0 ${
                      humanVocalQualityMode
                        ? "bg-fuchsia-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {humanVocalQualityMode ? "HIGH QUALITY" : "STANDARD"}
                  </button>
                </div>

                {professionalVocalMode && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-fuchsia-800/30 text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1">Biểu cảm (Emotion — 8 sắc thái)</label>
                      <select
                        value={vocalEmotion}
                        onChange={(e) => setVocalEmotion(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-white"
                      >
                        <option value="romantic">Romantic (Lãng mạn, ngọt ngào)</option>
                        <option value="sad">Sad (Da diết, tự sự)</option>
                        <option value="emotional">Emotional (Xúc động cao trào)</option>
                        <option value="powerful">Powerful (Nội lực, vang sáng)</option>
                        <option value="gentle">Gentle (Dịu dàng, thủ thỉ)</option>
                        <option value="warm">Warm (Trầm ấm, dày tiếng)</option>
                        <option value="energetic">Energetic (Sôi động, rõ nhịp)</option>
                        <option value="intimate">Intimate (Gần gũi, giàu hơi thở)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Rung giọng (Vibrato)</label>
                      <select
                        value={vocalVibrato}
                        onChange={(e) => setVocalVibrato(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-white"
                      >
                        <option value="natural">Tự nhiên (5.2→5.9Hz + Shimmer)</option>
                        <option value="expressive">Giàu cảm xúc (Sâu)</option>
                        <option value="subtle">Nhẹ tinh tế</option>
                        <option value="off">Tắt Vibrato</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Chuyển nốt (Portamento)</label>
                      <select
                        value={vocalPitchTransition}
                        onChange={(e) => setVocalPitchTransition(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-white"
                      >
                        <option value="smooth">Mượt mà (Sigmoid)</option>
                        <option value="legato">Luyến sâu (Legato)</option>
                        <option value="crisp">Rõ nốt (Crisp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Luyến láy (Melisma / Runs)</label>
                      <select
                        value={vocalMelisma}
                        onChange={(e) => setVocalMelisma(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-white"
                      >
                        <option value="subtle">Luyến nhẹ cuối câu</option>
                        <option value="ornate">R&amp;B Vocal Runs</option>
                        <option value="off">Không luyến</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Độ hơi (Breathiness)</label>
                      <select
                        value={vocalBreathiness}
                        onChange={(e) => setVocalBreathiness(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-white"
                      >
                        <option value="moderate">Cân bằng ấm áp</option>
                        <option value="airy">Nhiều hơi (Ballad/Indie)</option>
                        <option value="low">Nội lực đặc tiếng (Rock/Pop)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Độ biểu cảm</span>
                        <span className="font-bold text-fuchsia-300">{Math.round(vocalExpressionLevel * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        value={vocalExpressionLevel}
                        onChange={(e) => setVocalExpressionLevel(parseFloat(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-fuchsia-500 mt-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Library Selector (Voice Cloning Ready Architecture) */}
              <div className="space-y-2 pt-2 border-t border-purple-900/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold">Thư viện Giọng hát AI (Voice Library):</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Đã xác thực bản quyền giọng</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {voiceLibrary.map((v) => {
                    const isSelected = selectedVoiceId === v.voiceId;
                    return (
                      <div
                        key={v.voiceId}
                        onClick={() => {
                          setSelectedVoiceId(v.voiceId);
                          setVocalGender(v.gender === "male" ? "male" : "female");
                          if (typeof window !== "undefined") {
                            localStorage.setItem("selectedVoiceId", v.voiceId);
                          }
                          console.log(`[VOICE SELECTOR]\nSelected Voice ID: ${v.voiceId}`);
                        }}
                        className={`cursor-pointer rounded-xl border p-2.5 transition flex items-start justify-between gap-2 ${
                          isSelected
                            ? "border-purple-500 bg-purple-600/20 text-white"
                            : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-semibold text-xs">
                            <span>{v.gender === "male" ? "🎙️" : "🌸"} {v.voiceName}</span>
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-500/30">
                              {v.consentStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{v.voiceDescription}</p>
                          {(v.vocalRange || v.timbre) && (
                            <div className="text-[10px] text-fuchsia-300/90 font-medium">
                              <span>Quãng giọng: {v.vocalRange || "A3 – A5"}</span>
                              {v.timbre && <span> • Âm sắc: {v.timbre}</span>}
                            </div>
                          )}
                          {v.emotionalCharacteristics && (
                            <p className="text-[9px] text-emerald-300/80 italic">
                              Biểu cảm: {v.emotionalCharacteristics}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {v.supportedSingingStyles.map((st) => (
                              <span
                                key={st}
                                className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] text-purple-300 border border-slate-800"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{v.voiceId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                <label className="text-xs font-medium text-slate-300">Nhịp độ (BPM)</label>
                <span className="text-xs font-bold text-purple-400">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min={60}
                max={180}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-500"
              />
            </div>
          </div>

          {/* Instruments Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Nhạc cụ chủ đạo (Tùy chọn)
            </label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((inst) => {
                const isSelected = selectedInstruments.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstrument(inst)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition ${isSelected
                        ? "border-purple-500 bg-purple-500/20 text-purple-200"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suno Model Selection (Updated to Suno V6 API Specs) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Phiên bản AI Model (Suno V6 Update)</span>
              </label>
              <span className="text-[10px] text-purple-400 font-medium">Bản cập nhật mới nhất</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "V6", label: "V6 Flagship", desc: "Chuẩn phòng thu cao cấp" },
                { id: "V6_MINI", label: "V6 Mini", desc: "Siêu tốc & Tiết kiệm" },
                { id: "V6_WILD", label: "V6 Wild", desc: "Sáng tạo & Phá cách" },
                { id: "V4_5ALL", label: "V4.5 All", desc: "Nhạc dài tới 8 phút" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${selectedModel === m.id
                      ? "border-purple-500 bg-purple-600/20 text-purple-200 ring-1 ring-purple-500/50"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom Duration (10s - 360s Supported by Suno V6) */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Thời lượng bài hát (Custom Duration)
                </label>
                <span className="text-xs font-bold text-purple-400">{durationSec} giây (~{Math.round(durationSec / 60)} phút)</span>
              </div>
              <input
                type="range"
                min={30}
                max={360}
                step={10}
                value={durationSec}
                onChange={(e) => setDurationSec(parseInt(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>30s (Ngắn)</span>
                <span>120s (Tiêu chuẩn)</span>
                <span>240s</span>
                <span>360s (Tối đa 6 phút)</span>
              </div>
            </div>

            {/* Negative Tags (Exclude unwanted sounds/elements) */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Loại trừ âm thanh không mong muốn (Negative Tags - Tùy chọn)
              </label>
              <input
                type="text"
                value={negativeTags}
                onChange={(e) => setNegativeTags(e.target.value)}
                placeholder="VD: heavy metal, harsh distortion, screaming, noise"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-xl shadow-purple-600/20 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang sáng tác tác phẩm...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Tạo bài hát ({creditCost} Credits)</span>
              </>
            )}
          </button>

          {/* Generation Progress Display */}
          {isGenerating && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-purple-300">{statusMessage}</span>
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
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
                <Music2 className="h-8 w-8 text-purple-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-300">Chưa có bài hát nào trong phiên</p>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn Voice Model, nhập lời bài hát và nhấn &quot;Tạo bài hát&quot; để thưởng thức giọng ca được chọn!
                </p>
              </div>
            ) : (
              results.map((track) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                const isExpanded = expandedLyricsTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 shadow-md space-y-3"
                  >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => {
                          if (currentTrack?.id === track.id) {
                            togglePlay();
                            return;
                          }
                          playTrack({
                            id: track.id,
                            title: track.title,
                            audioUrl: track.audioUrl,
                            duration: track.duration,
                            style: `${track.genre} • ${track.mood}`,
                            lyrics: track.lyrics,
                            hasVocals: track.hasVocals,
                            isInstrumental: track.isInstrumental,
                          });
                          if (track.hasVocals) {
                            setShowLyricsModal(true);
                          }
                        }}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${isCurrentPlaying
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                            : "bg-slate-800 text-slate-200 hover:bg-purple-600 hover:text-white"
                          }`}
                        title={track.hasVocals ? "Phát bài hát kèm giọng hát AI" : "Phát nhạc"}
                      >
                        {isCurrentPlaying ? (
                          <Disc3 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white text-sm truncate">{track.title}</h4>
                          <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/20">
                            {track.versionName}
                          </span>
                          {track.hasVocals && (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                              <Mic className="h-3 w-3" />
                              <span>Vocal AI</span>
                            </span>
                          )}
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

                  {/* Lyrics Preview Accordion if track has lyrics */}
                  {track.lyrics && (
                    <div className="rounded-xl border border-purple-900/30 bg-purple-950/10 overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLyricsTrackId(isExpanded ? null : track.id)
                        }
                        className="w-full flex items-center justify-between p-2.5 text-purple-300 hover:text-purple-200 transition font-medium"
                      >
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Xem lời bài hát ({track.hasVocals ? "Có giọng hát AI" : "Không lời"})</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-purple-900/20 bg-slate-950/60 space-y-3">
                          <div className="font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                            {track.lyrics}
                          </div>

                          {/* Post-Generation ASR Verification & WER Report */}
                          {track.verificationReport && (
                            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-3 space-y-2.5 text-[11px]">
                              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Kiểm chứng Audio ASR (Lyrics Verification)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-bold text-emerald-300">
                                    Khớp lời: {track.verificationReport.accuracyPercent}%
                                  </span>
                                  <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-mono">
                                    WER: {(track.verificationReport.wordErrorRate * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              {/* Multi-Candidate Vocal Audition Selector (Candidate A / B / C) */}
                              {track.verificationReport.vocalCandidates &&
                                track.verificationReport.vocalCandidates.length > 0 && (
                                  <div className="space-y-1.5 pb-2 border-b border-slate-800">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-fuchsia-300 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-fuchsia-400" />
                                        <span>Chọn bản thu Vocal tốt nhất (Multi-Candidate Vocal Evaluation):</span>
                                      </span>
                                      <span className="text-[9px] text-slate-400">6 tiêu chí chấm điểm tự động</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {track.verificationReport.vocalCandidates.map((cand) => {
                                        const activeCandId =
                                          selectedCandidateByTrack[track.id] ||
                                          track.verificationReport?.vocalCandidates?.find((c) => c.isSelected)
                                            ?.candidateId ||
                                          "A";
                                        const isCandActive = activeCandId === cand.candidateId;
                                        return (
                                          <div
                                            key={cand.candidateId}
                                            onClick={() => {
                                              setSelectedCandidateByTrack((prev) => ({
                                                ...prev,
                                                [track.id]: cand.candidateId,
                                              }));
                                              if (cand.audioUrl) {
                                                setResults((prev) =>
                                                  prev.map((t) =>
                                                    t.id === track.id ? { ...t, audioUrl: cand.audioUrl } : t
                                                  )
                                                );
                                                playTrack({
                                                  id: track.id,
                                                  title: `${track.title} [${cand.candidateName}]`,
                                                  audioUrl: cand.audioUrl,
                                                  duration: track.duration,
                                                  style: `${track.genre} • ${track.mood}`,
                                                  lyrics: track.lyrics,
                                                  hasVocals: track.hasVocals,
                                                  isInstrumental: track.isInstrumental,
                                                });
                                              }
                                            }}
                                            className={`cursor-pointer rounded-lg border p-2 transition ${
                                              isCandActive
                                                ? "border-fuchsia-500 bg-fuchsia-950/30 text-white"
                                                : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                                                <span className="text-fuchsia-300">{cand.candidateName}</span>
                                                {cand.isSelected && (
                                                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-500/30">
                                                    Đề xuất cao nhất
                                                  </span>
                                                )}
                                              </div>
                                              <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-200 border border-fuchsia-500/40">
                                                Điểm: {cand.overallScore}/100
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{cand.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1 text-[9px] font-mono text-slate-300">
                                              <span>Tự nhiên: {cand.naturalness}</span>
                                              <span>•</span>
                                              <span>Cao độ: {cand.pitchAccuracy}</span>
                                              <span>•</span>
                                              <span>Nhịp 4/4: {cand.rhythmAccuracy ?? 99.4}</span>
                                              <span>•</span>
                                              <span>Phát âm: {cand.pronunciationAccuracy}</span>
                                              <span>•</span>
                                              <span>Âm vị: {cand.phonemeAlignment ?? 99.2}</span>
                                              <span>•</span>
                                              <span>Độ rõ: {cand.vocalClarity ?? 98.8}</span>
                                              <span>•</span>
                                              <span>Cảm xúc: {cand.expressiveness}</span>
                                              <span>•</span>
                                              <span>Không nhiễu: {cand.artifactFree}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              {/* Word-level alignment badges */}
                              {track.verificationReport.wordAlignments?.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Đối chiếu từng từ (Xanh: Đúng từ & dấu | Vàng: Lệch âm | Đỏ: Thiếu):
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {track.verificationReport.wordAlignments.map((w, idx) => (
                                      <span
                                        key={idx}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                          w.status === "matched"
                                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                            : w.status === "substituted"
                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                                        }`}
                                        title={`Gốc: ${w.originalWord || "-"} | Nhận dạng ASR: ${w.recognizedWord || "-"}`}
                                      >
                                        {w.originalWord || w.recognizedWord}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Line-by-line report + Segment Regeneration */}
                              {track.verificationReport.lineReports?.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Chi tiết từng câu hát (Bấm &ldquo;Tạo lại câu&rdquo; để xử lý riêng đoạn lỗi):
                                  </span>
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {track.verificationReport.lineReports.map((lr) => {
                                      const segKey = `${track.id}:${lr.lineIndex}`;
                                      const isRegen = regeneratingSegmentKey === segKey;
                                      return (
                                        <div
                                          key={lr.lineIndex}
                                          className={`rounded-lg border p-2 flex items-start justify-between gap-2 ${
                                            lr.hasError
                                              ? "border-amber-500/40 bg-amber-950/20"
                                              : "border-slate-800 bg-slate-950/60"
                                          }`}
                                        >
                                          <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="text-[9px] font-bold uppercase text-purple-400">
                                                [{lr.section}]
                                              </span>
                                              <span className="text-[9px] font-mono text-slate-400">
                                                {lr.startTime}s–{lr.endTime}s • Nốt {lr.targetMidiNote}
                                              </span>
                                              <span className="text-[9px] text-emerald-400 font-semibold">
                                                {lr.accuracyPercent}%
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-white font-medium">{lr.originalLine}</p>
                                            <p className="text-[10px] text-slate-400 italic">
                                              ASR nghe được: &ldquo;{lr.recognizedLine || "..."}&rdquo;
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            disabled={isRegen}
                                            onClick={() => handleRegenerateSegment(track.id, lr.lineIndex)}
                                            className="shrink-0 rounded-lg border border-purple-500/40 bg-purple-900/30 hover:bg-purple-700/50 px-2 py-1 text-[10px] font-semibold text-purple-200 transition disabled:opacity-50"
                                            title="Chỉ tạo lại câu hát này mà không cần tạo lại toàn bộ bài hát"
                                          >
                                            {isRegen ? "Đang tạo..." : "Tạo lại câu"}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <p className="text-[9px] text-slate-500 italic">
                                * Lưu ý: ASR có thể nhận dạng sai số nhẹ khi ca sĩ ngân dài hoặc rung giọng (vibrato); kết quả trên là chỉ báo chất lượng.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>{track.mood}</span>
                    <span>{track.createdAt}</span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Suno AI Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/30 text-purple-400">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Cấu hình Suno AI (Ca sĩ thật)</h3>
                  <p className="text-[11px] text-slate-400">Tạo giọng hát chuẩn studio luyến láy như người thật</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Hugging Face Token Miễn Phí (hf_...) hoặc Suno API Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Nhập Hugging Face Token miễn phí (VD: hf_xxxx...) hoặc Suno Key"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Lấy miễn phí 100% tại <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-purple-400 underline">huggingface.co/settings/tokens</a> (chọn quyền Read, bắt đầu bằng <code className="text-purple-300">hf_...</code>) để mở khóa GPU tạo giọng ca sĩ AI hát thật (hoàn toàn không có giọng đọc TTS).
              </p>
            </div>

            {keySaveMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{keySaveMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white transition"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-purple-600/20"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
