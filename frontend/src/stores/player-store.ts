import { create } from "zustand";

export interface AudioTrack {
  id: string;
  title: string;
  audioUrl: string;
  duration?: number;
  prompt?: string;
  style?: string;
  coverUrl?: string;
  projectId?: string;
  lyrics?: string;
  hasVocals?: boolean;
  isInstrumental?: boolean;
}

interface PlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Vocal AI Synthesis state
  vocalEnabled: boolean;
  vocalVolume: number;
  vocalGender: "female" | "male";
  currentLyricIndex: number;
  showLyricsModal: boolean;

  playTrack: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;

  toggleVocal: () => void;
  setVocalVolume: (vol: number) => void;
  setVocalGender: (gender: "female" | "male") => void;
  setCurrentLyricIndex: (index: number) => void;
  setShowLyricsModal: (show: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,

  vocalEnabled: true,
  vocalVolume: 0.9,
  vocalGender: "female",
  currentLyricIndex: -1,
  showLyricsModal: false,

  playTrack: (track) => {
    const current = get().currentTrack;
    if (current?.id === track.id) {
      set({ isPlaying: true });
    } else {
      set({
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        duration: track.duration || 0,
        currentLyricIndex: -1,
      });
    }
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  closePlayer: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      currentLyricIndex: -1,
      showLyricsModal: false,
    }),

  toggleVocal: () => set((state) => ({ vocalEnabled: !state.vocalEnabled })),
  setVocalVolume: (vocalVolume) => set({ vocalVolume }),
  setVocalGender: (vocalGender) => set({ vocalGender }),
  setCurrentLyricIndex: (currentLyricIndex) => set({ currentLyricIndex }),
  setShowLyricsModal: (showLyricsModal) => set({ showLyricsModal }),
}));
