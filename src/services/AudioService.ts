import { SPEED_PRESETS, type SpeedLevel } from '../types';

type AudioEventCallback = () => void;

export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private blobUrl: string | null = null;
  private speedIndex = 2; // default: 1.0x
  private onTimeUpdateCallbacks: AudioEventCallback[] = [];
  private onEndedCallbacks: AudioEventCallback[] = [];
  private onLoadCallbacks: AudioEventCallback[] = [];
  private rafId: number | null = null;

  get isLoaded(): boolean {
    return this.audio !== null && this.audio.readyState >= 2;
  }

  get isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused;
  }

  get duration(): number {
    return this.audio?.duration ?? 0;
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  get speed(): SpeedLevel {
    return SPEED_PRESETS[this.speedIndex];
  }

  get fileName(): string {
    return this.audio?.dataset.fileName ?? '';
  }

  // --- Lifecycle ---

  /**
   * Load audio from base64 data (received via IPC from main process).
   */
  loadFromBase64(base64: string, mime: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cleanup();

      // Convert base64 to Blob
      const byteChars = atob(base64);
      const byteArrays: Uint8Array[] = [];
      const sliceSize = 512;
      for (let i = 0; i < byteChars.length; i += sliceSize) {
        const slice = byteChars.slice(i, i + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: mime });
      this.blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.blobUrl);
      audio.dataset.fileName = fileName;
      audio.preload = 'auto';
      audio.playbackRate = SPEED_PRESETS[this.speedIndex];

      audio.addEventListener('canplaythrough', () => {
        this.audio = audio;
        this.startTimeTracking();
        this.onLoadCallbacks.forEach((cb) => cb());
        resolve();
      }, { once: true });

      audio.addEventListener('error', (e) => {
        reject(new Error('Failed to load audio file'));
      });

      audio.load();
    });
  }

  /**
   * Load audio from a URL (for production build or file:// URLs).
   */
  loadFromUrl(url: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cleanup();

      const audio = new Audio(url);
      audio.dataset.fileName = fileName;
      audio.preload = 'auto';
      audio.playbackRate = SPEED_PRESETS[this.speedIndex];

      const handleCanPlay = () => {
        this.audio = audio;
        this.startTimeTracking();
        this.onLoadCallbacks.forEach((cb) => cb());
        resolve();
      };

      const handleError = () => {
        reject(new Error('Failed to load audio file'));
      };

      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      audio.load();
    });
  }

  play(): void {
    if (!this.audio) return;
    this.audio.play().catch(() => {});
  }

  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time: number): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  seekRelative(delta: number): void {
    this.seek(this.currentTime + delta);
  }

  setSpeed(level: SpeedLevel): void {
    const idx = SPEED_PRESETS.indexOf(level);
    if (idx === -1) return;
    this.speedIndex = idx;
    if (this.audio) {
      this.audio.playbackRate = level;
    }
  }

  cycleSpeed(): void {
    this.speedIndex = (this.speedIndex + 1) % SPEED_PRESETS.length;
    const speed = SPEED_PRESETS[this.speedIndex];
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  // --- Events ---

  onTimeUpdate(cb: AudioEventCallback): () => void {
    this.onTimeUpdateCallbacks.push(cb);
    return () => {
      this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  onEnded(cb: AudioEventCallback): () => void {
    this.onEndedCallbacks.push(cb);
    return () => {
      this.onEndedCallbacks = this.onEndedCallbacks.filter((c) => c !== cb);
    };
  }

  onLoad(cb: AudioEventCallback): () => void {
    this.onLoadCallbacks.push(cb);
    return () => {
      this.onLoadCallbacks = this.onLoadCallbacks.filter((c) => c !== cb);
    };
  }

  // --- Internal ---

  private startTimeTracking(): void {
    const tick = () => {
      if (this.audio && !this.audio.paused) {
        this.onTimeUpdateCallbacks.forEach((cb) => cb());
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    // Also listen for 'ended' via event
    this.audio?.addEventListener('ended', () => {
      this.onEndedCallbacks.forEach((cb) => cb());
    });
  }

  cleanup(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
    // Don't clear callbacks - they are managed by React effects
  }
}

// Singleton
export const audioService = new AudioService();
