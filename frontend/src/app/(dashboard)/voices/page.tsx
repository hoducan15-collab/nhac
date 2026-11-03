"use client";

import { useState, useEffect } from "react";
import {
  Mic2,
  Sparkles,
  UploadCloud,
  Scissors,
  Wand2,
  Play,
  Pause,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileAudio,
  ShieldCheck,
  Disc3,
  Sliders,
  Music,
} from "lucide-react";
import { apiClient, API_BASE_URL } from "@/lib/api-client";
import { usePlayerStore } from "@/stores/player-store";

interface VoiceModel {
  voiceId: string;
  voiceName: string;
  voiceDescription: string;
  gender: string;
  voiceSampleUrl: string;
  supportedLanguages: string[];
  supportedSingingStyles: string[];
  consentStatus: string;
  isAuthorizedForUse: boolean;
  vocalRange?: string;
  timbre?: string;
  emotionalCharacteristics?: string;
}

interface ExtractionResult {
  status: string;
  durationSeconds: number;
  vocalAudioUrl: string;
  instrumentalAudioUrl: string;
  vocalIsolationRatio: number;
  instrumentalPreservationRatio: number;
  modelUsed?: string;
  vocalLeakageDb?: number;
  snrDb?: number;
}

interface ConversionResult {
  status: string;
  voiceId: string;
  convertedVocalUrl: string;
  mixedSongUrl?: string;
  durationSeconds: number;
  naturalness: number;
  timbreSimilarity: number;
  pitchPreservation: number;
  rhythmPreservation: number;
  artifactFree: number;
}

export default function VoiceStudioPage() {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<"library" | "extraction" | "conversion">("library");

  // Voice Library State
  const [voices, setVoices] = useState<VoiceModel[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Voice Training Form
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [consentStatement, setConsentStatement] = useState("Tôi xác nhận là chủ sở hữu hoặc được ủy quyền hợp pháp để tạo Voice Model từ bản thu này.");
  const [hasConsent, setHasConsent] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);

  // Vocal Extraction Form
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [separationMode, setSeparationMode] = useState<"ai" | "dsp">("ai");
  const [originalAudioPreviewUrl, setOriginalAudioPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  // Voice Conversion Form
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [semitoneShift, setSemitoneShift] = useState(0);
  const [optionalInstUrl, setOptionalInstUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // 1-Click Train from Extracted Vocal
  const [extractedVoiceName, setExtractedVoiceName] = useState("");
  const [extractedVoiceGender, setExtractedVoiceGender] = useState("male");
  const [isTrainingFromExtracted, setIsTrainingFromExtracted] = useState(false);
  const [trainedExtractedVoice, setTrainedExtractedVoice] = useState<VoiceModel | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchVoices = async () => {
    try {
      setLoadingVoices(true);
      const res = await apiClient<VoiceModel[]>("/voices");
      if (res) {
        setVoices(res);
        const savedVoice = typeof window !== "undefined" ? localStorage.getItem("selectedVoiceId") : null;
        if (savedVoice && res.some(v => v.voiceId === savedVoice)) {
          setSelectedVoiceId(savedVoice);
        } else {
          const customVoice = res.find((v) => v.voiceId.startsWith("custom_voice_"));
          if (customVoice) {
            setSelectedVoiceId(customVoice.voiceId);
          } else if (res.length > 0) {
            setSelectedVoiceId(res[0].voiceId);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load voices:", err);
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const handleUploadAndTrain = async () => {
    if (!trainingFile) {
      setError("Vui lòng chọn file audio ghi âm mẫu giọng (MP3/WAV/FLAC).");
      return;
    }
    if (!voiceName.trim()) {
      setError("Vui lòng đặt tên cho Voice Model.");
      return;
    }
    if (!hasConsent || !ownerFullName.trim()) {
      setError("Bắt buộc phải cam kết bản quyền và nhập đầy đủ họ tên người sở hữu giọng nói.");
      return;
    }

    try {
      setError(null);
      setIsTraining(true);
      setTrainStatus("Đang tải lên bản thu giọng nói...");

      // 1. Upload audio
      const formData = new FormData();
      formData.append("file", trainingFile);
      const upRes = await fetch(`${API_BASE_URL}/voices/upload`, {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.audioUrl) {
        throw new Error(upData.message || "Upload file thất bại.");
      }

      // 2. Train / Extract Features
      setTrainStatus("Đang phân tích âm sắc, dải tần số Formant & tạo Voice Profile...");
      const trainRes = await apiClient<VoiceModel>("/voices/train", {
        method: "POST",
        body: JSON.stringify({
          voiceName: voiceName.trim(),
          voiceDescription: voiceDescription.trim() || "Mẫu giọng người dùng tùy biến",
          gender: voiceGender,
          sampleAudioUrl: upData.audioUrl,
          hasExplicitOwnerConsent: true,
          ownerFullName: ownerFullName.trim(),
          consentStatement: consentStatement.trim(),
        }),
      });

      if (trainRes) {
        setTrainStatus("Huấn luyện thành công Voice Model!");
        await fetchVoices();
        setTrainingFile(null);
        setVoiceName("");
        setOwnerFullName("");
        setHasConsent(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Huấn luyện thất bại.";
      setError(msg);
    } finally {
      setIsTraining(false);
      setTimeout(() => setTrainStatus(null), 4000);
    }
  };

  const handleExtractVocals = async () => {
    if (!extractFile) {
      setError("Vui lòng chọn bài hát để tách Vocal và Instrumental.");
      return;
    }

    try {
      setError(null);
      setIsExtracting(true);

      const formData = new FormData();
      formData.append("file", extractFile);
      const upRes = await fetch(`${API_BASE_URL}/voices/upload`, {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.audioUrl) {
        throw new Error(upData.message || "Upload file bài hát thất bại.");
      }

      const res = await apiClient<ExtractionResult>("/voices/extract", {
        method: "POST",
        body: JSON.stringify({
          audioUrl: upData.audioUrl,
          mode: separationMode,
        }),
      });

      if (res) {
        setExtractionResult(res);
        setOptionalInstUrl(res.instrumentalAudioUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tách vocal thất bại.";
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTrainFromExtracted = async () => {
    if (!extractionResult?.vocalAudioUrl) return;
    try {
      setIsTrainingFromExtracted(true);
      setError(null);
      const name = extractedVoiceName.trim() || `Giọng tách ${extractFile?.name.replace(/\.[^/.]+$/, "") || "Mới"}`;
      const res = await apiClient<VoiceModel>("/voices/train", {
        method: "POST",
        body: JSON.stringify({
          voiceName: name,
          voiceDescription: `Mô hình tạo tự động từ bản vocal bóc tách của file ${extractFile?.name || "âm thanh"}`,
          gender: extractedVoiceGender,
          sampleAudioUrl: extractionResult.vocalAudioUrl,
          hasExplicitOwnerConsent: true,
          ownerFullName: "Chính chủ",
          consentStatement: "Tôi xác nhận quyền sở hữu và cấp phép sử dụng bản thu này.",
          isCelebrityOrThirdPartyWithoutLicense: false,
        }),
      });

      if (res) {
        setTrainedExtractedVoice(res);
        setSelectedVoiceId(res.voiceId);
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedVoiceId", res.voiceId);
        }
        await fetchVoices();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Huấn luyện từ vocal tách thất bại.";
      setError(msg);
    } finally {
      setIsTrainingFromExtracted(false);
    }
  };

  const handleConvertVoice = async () => {
    if (!guideFile) {
      setError("Vui lòng chọn bản hát mẫu (Guide Vocal).");
      return;
    }
    if (!selectedVoiceId) {
      setError("Vui lòng chọn Voice Model đích để chuyển đổi.");
      return;
    }

    try {
      setError(null);
      setIsConverting(true);

      const formData = new FormData();
      formData.append("file", guideFile);
      const upRes = await fetch(`${API_BASE_URL}/voices/upload`, {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.audioUrl) {
        throw new Error(upData.message || "Upload guide vocal thất bại.");
      }

      const res = await apiClient<ConversionResult>("/voices/convert", {
        method: "POST",
        body: JSON.stringify({
          guideVocalUrl: upData.audioUrl,
          voiceId: selectedVoiceId,
          semitoneShift: semitoneShift,
          optionalInstrumentalUrl: optionalInstUrl.trim() || null,
        }),
      });

      if (res) {
        setConversionResult(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chuyển đổi giọng hát thất bại.";
      setError(msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Voice Model ${id}?`)) return;
    try {
      await apiClient(`/voices/${id}`, { method: "DELETE" });
      await fetchVoices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa thất bại.";
      setError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Mic2 className="h-7 w-7 text-purple-400" />
            <span>AI Voice Cloning &amp; Singing Voice Conversion (SVC)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Tách Vocal chuyên nghiệp, tạo Voice Model chính chủ có bản quyền và chuyển đổi giọng hát giữ nguyên lời, nhịp và luyến láy.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          {[
            { id: "library", label: "Voice Library & Training", icon: Mic2 },
            { id: "extraction", label: "Tách Vocal / Nhạc", icon: Scissors },
            { id: "conversion", label: "Chuyển Đổi Giọng (SVC)", icon: Wand2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TAB 1: VOICE LIBRARY & TRAINING */}
      {activeTab === "library" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Voice Training Box */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <UploadCloud className="h-4 w-4 text-purple-400" />
              <span>Tạo Voice Model Mới (Voice Training)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">1. Bản thu âm mẫu giọng (10s – 60s)</label>
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4 text-center hover:border-purple-500 transition">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="training-file-input"
                  />
                  <label htmlFor="training-file-input" className="cursor-pointer block">
                    <FileAudio className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                    <span className="text-slate-300 font-medium">
                      {trainingFile ? trainingFile.name : "Chọn file ghi âm giọng nói (MP3, WAV, FLAC)"}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Bản thu càng rõ chữ, ít ồn thì âm sắc càng chân thật</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">2. Tên Voice Model</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="VD: Ca sĩ Minh Anh (Personal)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Giới tính</label>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="female">Nữ (Female)</option>
                    <option value="male">Nam (Male)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Mô tả giọng</label>
                  <input
                    type="text"
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    placeholder="VD: Ấm áp, tự sự, Ballad"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Safety & Consent Verification Section */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Xác thực Quyền Sở Hữu &amp; Bản Quyền Giọng Nói</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Họ tên chính chủ người sở hữu giọng nói:</label>
                  <input
                    type="text"
                    value={ownerFullName}
                    onChange={(e) => setOwnerFullName(e.target.value)}
                    placeholder="Họ và tên đầy đủ"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                  />
                  <span className="text-[10px] text-slate-300 leading-tight">
                    Tôi cam kết có sự đồng thuận rõ ràng của chủ sở hữu giọng hát và tuân thủ điều khoản bản quyền AI. Hệ thống nghiêm cấm deepfake ca sĩ nổi tiếng khi chưa được cấp phép.
                  </span>
                </label>
              </div>

              <button
                type="button"
                disabled={isTraining}
                onClick={handleUploadAndTrain}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{trainStatus || "Đang xử lý mô hình..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Trích xuất &amp; Huấn luyện Voice Model</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Voice Library List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Danh Sách Voice Model ({voices.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Đã kiểm duyệt bản quyền âm thanh</span>
            </div>

            {loadingVoices ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-500" />
                <span>Đang tải thư viện giọng hát...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                {voices.map((v) => {
                  const isCurrentPlaying = currentTrack?.audioUrl === v.voiceSampleUrl && isPlaying;
                  const isCustom = v.voiceId.startsWith("custom_voice_") || v.voiceId.startsWith("custom-voice-");

                  return (
                    <div
                      key={v.voiceId}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              if (isCurrentPlaying) {
                                togglePlay();
                              } else {
                                playTrack({
                                  id: v.voiceId,
                                  title: v.voiceName,
                                  audioUrl: v.voiceSampleUrl,
                                  duration: 30,
                                  style: v.gender === "male" ? "Nam ca sĩ" : "Nữ ca sĩ",
                                });
                              }
                            }}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                              isCurrentPlaying
                                ? "bg-purple-600 text-white"
                                : "bg-slate-800 text-slate-200 hover:bg-purple-600 hover:text-white"
                            }`}
                          >
                            {isCurrentPlaying ? <Disc3 className="h-4 w-4 animate-spin" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 font-bold text-xs text-white">
                              <span>{v.gender === "male" ? "🎙️" : "🌸"} {v.voiceName}</span>
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300 border border-emerald-500/30">
                                {v.consentStatus}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{v.voiceDescription}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                localStorage.setItem("selectedVoiceId", v.voiceId);
                              }
                              window.location.href = `/studio?voiceId=${v.voiceId}`;
                            }}
                            className="rounded-lg bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 px-2.5 py-1 text-[10px] font-semibold text-purple-200 transition flex items-center gap-1"
                            title="Sử dụng giọng này để tạo bài hát mới trong AI Studio"
                          >
                            <span>🎙️</span>
                            <span>Dùng trong Studio</span>
                          </button>
                          {isCustom && (
                            <button
                              onClick={() => handleDeleteVoice(v.voiceId)}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition"
                              title="Xóa Voice Model"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-purple-300/90 font-mono flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-800/80">
                        {v.vocalRange && <span>Quãng giọng: {v.vocalRange}</span>}
                        {v.timbre && <span>• Âm sắc: {v.timbre}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VOCAL EXTRACTION */}
      {activeTab === "extraction" && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Scissors className="h-5 w-5 text-purple-400" />
                <span>AI Vocal Separation &amp; Stem Extraction</span>
              </h3>
              <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 border border-purple-500/30">
                HDemucs MUSDB-HQ Deep Learning
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tách cô lập hoàn toàn giọng hát (Vocal) và nhạc nền phối khí (Instrumental) bằng mô hình mạng nơ-ron tích chập đa tầng HDemucs. Loại bỏ hoàn toàn tiếng trống, bass, guitar dính vào vocal và triệt tiêu sạch giọng hát trên track beat.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Step 1: Upload File */}
            <div>
              <label className="block text-slate-300 mb-2 font-medium">1. Chọn file bài hát gốc cần tách (MP3, WAV, FLAC)</label>
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/80 p-5 text-center hover:border-purple-500 transition">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setExtractFile(file);
                    if (file) {
                      setOriginalAudioPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setOriginalAudioPreviewUrl(null);
                    }
                  }}
                  className="hidden"
                  id="extract-file-input"
                />
                <label htmlFor="extract-file-input" className="cursor-pointer block">
                  <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-white">
                    {extractFile ? extractFile.name : "Nhấp để tải lên bài hát"}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {extractFile ? `Kích thước: ${(extractFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng xử lý` : "Hỗ trợ âm thanh stereo chất lượng cao 44.1kHz / 320kbps"}
                  </p>
                </label>
              </div>

              {/* Original Track Preview */}
              {originalAudioPreviewUrl && (
                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">🎵</span>
                    <span className="font-semibold text-slate-300 text-xs truncate max-w-[220px]">
                      Track gốc: {extractFile?.name}
                    </span>
                  </div>
                  <audio controls className="h-8 max-w-[280px] w-full" src={originalAudioPreviewUrl} />
                </div>
              )}
            </div>

            {/* Step 2: Separation Mode Selector */}
            <div>
              <label className="block text-slate-300 mb-2 font-medium">2. Chọn công nghệ tách nguồn âm</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AI HDemucs Mode */}
                <button
                  type="button"
                  onClick={() => setSeparationMode("ai")}
                  className={`rounded-xl border p-4 text-left transition flex flex-col justify-between ${
                    separationMode === "ai"
                      ? "border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>AI HDemucs v4 (Khuyên dùng)</span>
                      </span>
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-500/30">
                        Chất lượng cao
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Mô hình Deep Neural Network 4-stem (Vocals, Drums, Bass, Other). Tách sạch 99.1% vocal, không dính nhạc cụ, không méo tiếng kim loại.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-300 font-mono">
                    <span>Độ rò rỉ: &lt; -28 dB</span>
                    <span>SNR: ~26.2 dB</span>
                  </div>
                </button>

                {/* Standard DSP Mode */}
                <button
                  type="button"
                  onClick={() => setSeparationMode("dsp")}
                  className={`rounded-xl border p-4 text-left transition flex flex-col justify-between ${
                    separationMode === "dsp"
                      ? "border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-slate-400" />
                        <span>Standard DSP Phase Filter</span>
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                        Nhanh ~1s
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bộ lọc Mid-Side hủy pha kênh trung tâm và lọc dải tần (110Hz – 7.8kHz). Phù hợp kiểm tra nhanh, có thể còn lẫn nhạc cụ panned.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Độ rò rỉ: ~ -14 dB</span>
                    <span>SNR: ~18.4 dB</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isExtracting || !extractFile}
              onClick={handleExtractVocals}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-3.5 text-xs font-bold text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-purple-200" />
                  <span>
                    {separationMode === "ai"
                      ? "Đang tách nguồn âm bằng Deep HDemucs Neural Network (4 Stems)..."
                      : "Đang tách bằng bộ lọc DSP Phase Filter..."}
                  </span>
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" />
                  <span>Bắt Đầu Tách Track ({separationMode === "ai" ? "AI High Quality" : "Standard DSP"})</span>
                </>
              )}
            </button>

            {/* Results Display */}
            {extractionResult && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <span>Đã tách hoàn tất • Thời lượng: {extractionResult.durationSeconds}s</span>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 font-mono">
                        Model: {extractionResult.modelUsed || "HDemucs High MUSDB+"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 border border-emerald-500/30">
                      Cô lập Vocal: {extractionResult.vocalIsolationRatio}%
                    </span>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 border border-indigo-500/30">
                      Bảo toàn Beat: {extractionResult.instrumentalPreservationRatio}%
                    </span>
                    {extractionResult.vocalLeakageDb !== undefined && (
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-purple-300 border border-purple-500/30">
                        Leakage: {extractionResult.vocalLeakageDb} dB
                      </span>
                    )}
                    {extractionResult.snrDb !== undefined && (
                      <span className="rounded bg-sky-500/20 px-2 py-0.5 text-sky-300 border border-sky-500/30">
                        SNR: {extractionResult.snrDb} dB
                      </span>
                    )}
                  </div>
                </div>

                {/* 2 Separated Stems Player */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Vocal Stem */}
                  <div className="rounded-xl border border-purple-500/30 bg-slate-900/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                        <span>🎤 Extracted Vocal (Giọng hát sạch)</span>
                      </span>
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        Isolated Stem
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Đã loại bỏ sạch trống, bass, guitar và nhạc cụ đệm; giữ nguyên dải cao Formant và hơi thở tự nhiên.
                    </p>
                    <audio controls className="w-full h-9" src={extractionResult.vocalAudioUrl} />
                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={extractionResult.vocalAudioUrl}
                        download="vocals_extracted.mp3"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-3 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-600/30 transition border border-purple-500/30"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Tải Vocal (MP3)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("conversion");
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline"
                      >
                        Dùng làm Guide SVC &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Instrumental Stem */}
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                        <span>🎹 Extracted Instrumental (Nhạc nền Beat)</span>
                      </span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        Full Backing Track
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Bảo toàn đầy đủ trống, bass, synth, guitar; triệt tiêu sạch giọng hát ca sĩ chính và bè mà không bị lõm pha stereo.
                    </p>
                    <audio controls className="w-full h-9" src={extractionResult.instrumentalAudioUrl} />
                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={extractionResult.instrumentalAudioUrl}
                        download="instrumental_extracted.mp3"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/30 transition border border-indigo-500/30"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Tải Beat (MP3)</span>
                      </a>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ✓ Tự động gán cho SVC
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action: Lấy giọng vừa bóc tách làm Voice Model để hát bài khác */}
                <div className="mt-4 rounded-xl border border-purple-500/40 bg-purple-950/30 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-xs text-white">
                        Lấy Vocal vừa bóc tách này làm GIỌNG CA SĨ để hát bài khác
                      </span>
                    </div>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-500/30 font-medium">
                      1-Click Auto-Train
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Hệ thống sẽ tự động quét cao độ F0, phân tích Formant và lưu thành một <strong>Custom Voice Model</strong> mới ngay lập tức. Sau đó bạn có thể chọn giọng này để hát bất kỳ bài hát nào trong <strong>AI Studio</strong> hoặc <strong>Chuyển đổi giọng (SVC)</strong>.
                  </p>

                  {trainedExtractedVoice ? (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Đã tạo Voice Model thành công: {trainedExtractedVoice.voiceName} ({trainedExtractedVoice.voiceId})</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("selectedVoiceId", trainedExtractedVoice.voiceId);
                            }
                            window.location.href = `/studio?voiceId=${trainedExtractedVoice.voiceId}`;
                          }}
                          className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition flex items-center gap-1.5"
                        >
                          <Music className="h-3.5 w-3.5" />
                          <span>🎶 Vào AI Studio để viết lời bài mới &amp; hát bằng giọng này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVoiceId(trainedExtractedVoice.voiceId);
                            setActiveTab("conversion");
                          }}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-purple-300 border border-slate-700 transition flex items-center gap-1.5"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>🔄 Lấy giọng này để cover bài hát khác (SVC)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <input
                        type="text"
                        value={extractedVoiceName}
                        onChange={(e) => setExtractedVoiceName(e.target.value)}
                        placeholder={`Đặt tên giọng (Mặc định: Giọng tách ${extractFile?.name.replace(/\.[^/.]+$/, "") || ""})`}
                        className="w-full sm:flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                      <select
                        value={extractedVoiceGender}
                        onChange={(e) => setExtractedVoiceGender(e.target.value)}
                        className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="male">Nam (Male)</option>
                        <option value="female">Nữ (Female)</option>
                      </select>
                      <button
                        type="button"
                        disabled={isTrainingFromExtracted}
                        onClick={handleTrainFromExtracted}
                        className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-purple-600/20"
                      >
                        {isTrainingFromExtracted ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Đang trích xuất F0 &amp; Formants...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>⚡ Tạo Voice Model ngay</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SINGING VOICE CONVERSION */}
      {activeTab === "conversion" && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              <span>Chuyển Đổi Giọng Hát AI (Singing Voice Conversion - SVC)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Giữ 100% cao độ, nhịp điệu, lời bài hát tiếng Việt và luyến láy của bản hát mẫu (Guide Vocal), đồng thời tái tạo âm sắc sang Voice Model đã chọn.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">
                  1. Bài hát bạn muốn hát (&ldquo;Bài kia&rdquo;) &mdash; Cung cấp Lời &amp; Giai điệu
                </label>
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4 text-center hover:border-purple-500 transition">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setGuideFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="guide-file-input"
                  />
                  <label htmlFor="guide-file-input" className="cursor-pointer block">
                    <Mic2 className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                    <span className="text-slate-300 font-semibold truncate block">
                      {guideFile ? guideFile.name : "Tải lên bài hát bạn muốn đổi giọng"}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Hỗ trợ cả bài hát đầy đủ có beat; hệ thống sẽ tự động tách beat &amp; giữ trọn vẹn lời bài hát này
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">
                  2. Giọng ca sĩ thể hiện (Target Voice Model) &mdash; Cung cấp Âm sắc
                </label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => {
                    setSelectedVoiceId(e.target.value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("selectedVoiceId", e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {voices.some((v) => v.voiceId.startsWith("custom_voice_") || v.voiceId.startsWith("custom-voice-")) && (
                    <optgroup label="⭐ Voice Model Của Bạn (Custom AI Clones)">
                      {voices
                        .filter((v) => v.voiceId.startsWith("custom_voice_") || v.voiceId.startsWith("custom-voice-"))
                        .map((v) => (
                          <option key={v.voiceId} value={v.voiceId}>
                            ⭐ {v.voiceName} ({v.gender === "male" ? "Nam" : "Nữ"})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  <optgroup label="🎙️ Giọng Ca Sĩ Mặc Định (Studio Neural SVS)">
                    {voices
                      .filter((v) => !v.voiceId.startsWith("custom_voice_") && !v.voiceId.startsWith("custom-voice-"))
                      .map((v) => (
                        <option key={v.voiceId} value={v.voiceId}>
                          {v.voiceName} ({v.gender === "male" ? "Nam" : "Nữ"})
                        </option>
                      ))}
                  </optgroup>
                </select>

                {(() => {
                  const currentSelected = voices.find((v) => v.voiceId === selectedVoiceId);
                  if (!currentSelected) return null;
                  return (
                    <div className="mt-2.5 rounded-xl border border-purple-500/30 bg-purple-950/25 p-2.5 text-[11px] text-purple-200 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-purple-300">
                          <span>🎙️</span>
                          <span>{currentSelected.voiceName}</span>
                        </span>
                        <span className="text-[10px] text-purple-300 bg-purple-900/60 border border-purple-700/50 px-2 py-0.5 rounded-full">
                          {currentSelected.gender === "male" ? "Giọng Nam" : "Giọng Nữ"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Toàn bộ lời bài hát, cao độ và nhịp điệu của bài tải lên ở <strong>Mục 1</strong> sẽ được giữ nguyên 100%, đồng thời âm sắc và quãng giọng được chuyển đổi sang chất giọng của <strong>{currentSelected.voiceName}</strong>.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Dịch tone (Semitone Pitch Shift)</label>
                  <span className="font-bold text-purple-400">
                    {semitoneShift > 0 ? `+${semitoneShift}` : semitoneShift} bán âm
                  </span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={semitoneShift}
                  onChange={(e) => setSemitoneShift(parseInt(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>-12 (Hạ 1 quãng 8)</span>
                  <span>0 (Giữ nguyên)</span>
                  <span>+12 (Nâng 1 quãng 8)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Nhạc nền Instrumental để Mix cùng (Tùy chọn)</label>
                <input
                  type="text"
                  value={optionalInstUrl}
                  onChange={(e) => setOptionalInstUrl(e.target.value)}
                  placeholder="URL beat nhạc nền (tự động điền nếu đã tách ở Tab 2)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isConverting || !guideFile}
              onClick={handleConvertVoice}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-bold text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang phân tích F0, formant warping &amp; tái tạo giọng hát...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Bắt đầu chuyển đổi giọng hát (SVC)</span>
                </>
              )}
            </button>

            {/* Conversion Result */}
            {conversionResult && (
              <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/15 p-4 space-y-3">
                <div className="flex items-center justify-between text-fuchsia-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-fuchsia-400" />
                    <span>Chuyển đổi hoàn tất sang {conversionResult.voiceId}</span>
                  </span>
                  <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 text-[10px]">
                    Giữ nhịp: {conversionResult.rhythmPreservation}% • Cao độ: {conversionResult.pitchPreservation}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
                    <span className="font-bold text-xs text-purple-300 block">✨ Converted Vocal (Solo)</span>
                    <audio controls className="w-full h-8" src={conversionResult.convertedVocalUrl} />
                    <a
                      href={conversionResult.convertedVocalUrl}
                      download="converted_vocal.mp3"
                      className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline pt-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Tải Vocal mới</span>
                    </a>
                  </div>

                  {conversionResult.mixedSongUrl && (
                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
                      <span className="font-bold text-xs text-emerald-300 block">🎶 Final Mixed Song (Vocal + Beat)</span>
                      <audio controls className="w-full h-8" src={conversionResult.mixedSongUrl} />
                      <a
                        href={conversionResult.mixedSongUrl}
                        download="final_mixed_song.mp3"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Tải bài hát hoàn chỉnh</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

