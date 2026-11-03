/**
 * AI Lyric Karaoke Synchronizer
 * 
 * Provides synchronized lyric line tracking for karaoke visualization.
 * CRITICAL ARCHITECTURAL RULE:
 * Absolutely NO Web Speech API, SpeechSynthesis, or TTS speech readers are used here.
 * Real singing vocals are synthesized directly into the music file by the AI music model (Suno V6).
 */

export interface LyricLine {
  text: string;
  cleanText: string;
  section?: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
}

export interface VocalEngineOptions {
  volume?: number;       // 0.0 to 1.0 (Kept for interface compatibility)
  gender?: "female" | "male";
  onLineChange?: (lineIndex: number) => void;
}

export class VocalEngine {
  private static instance: VocalEngine | null = null;
  private lyrics: LyricLine[] = [];
  private currentLineIndex = -1;
  private options: Required<VocalEngineOptions>;

  private constructor() {
    this.options = {
      volume: 1.0,
      gender: "female",
      onLineChange: () => {},
    };
  }

  public static getInstance(): VocalEngine {
    if (!VocalEngine.instance) {
      VocalEngine.instance = new VocalEngine();
    }
    return VocalEngine.instance;
  }

  /**
   * Parse raw lyrics string into timed lyric lines across track duration for visual Karaoke tracking.
   */
  public loadLyrics(rawLyrics: string, trackDurationSeconds: number = 120) {
    this.stop();
    this.lyrics = [];
    this.currentLineIndex = -1;

    if (!rawLyrics || !rawLyrics.trim()) return;

    const rawLines = rawLyrics
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: { text: string; cleanText: string; section?: string }[] = [];
    let currentSection = "Verse";

    for (const line of rawLines) {
      const sectionMatch = line.match(/^\[(.*?)\]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
      } else {
        const cleanText = line.replace(/\[.*?\]/g, "").trim();
        if (cleanText.length > 0) {
          parsed.push({ text: line, cleanText, section: currentSection });
        }
      }
    }

    if (parsed.length === 0) return;

    // Distribute lyric lines across duration: 4s intro, 6s outro
    const introSeconds = Math.min(6, Math.max(3, trackDurationSeconds * 0.05));
    const availableSingingTime = Math.max(12, trackDurationSeconds - introSeconds - 6);
    const interval = availableSingingTime / parsed.length;

    this.lyrics = parsed.map((item, idx) => ({
      text: item.text,
      cleanText: item.cleanText,
      section: item.section,
      startTime: introSeconds + idx * interval,
      endTime: introSeconds + (idx + 1) * interval,
    }));
  }

  public getLyrics(): LyricLine[] {
    return this.lyrics;
  }

  public setOptions(newOptions: Partial<VocalEngineOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Called on audio timeupdate to update active lyric highlight in the UI.
   */
  public updateTime(currentTime: number, isPlaying: boolean) {
    if (!isPlaying || this.lyrics.length === 0) return;

    const activeIndex = this.lyrics.findIndex(
      (l) => currentTime >= l.startTime - 0.2 && currentTime < l.endTime
    );

    if (activeIndex !== -1 && activeIndex !== this.currentLineIndex) {
      this.currentLineIndex = activeIndex;
      this.options.onLineChange(activeIndex);
    }
  }

  public seekTo(time: number) {
    const activeIndex = this.lyrics.findIndex(
      (l) => time >= l.startTime && time < l.endTime
    );
    this.currentLineIndex = activeIndex;
    if (activeIndex !== -1) {
      this.options.onLineChange(activeIndex);
    }
  }

  public pause() {
    // No-op: visual sync only
  }

  public resume() {
    // No-op: visual sync only
  }

  public stop() {
    this.currentLineIndex = -1;
  }
}
