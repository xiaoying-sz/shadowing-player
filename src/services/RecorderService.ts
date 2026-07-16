export type RecordingState = 'idle' | 'recording' | 'done';

export class RecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private _state: RecordingState = 'idle';
  private _onStateChange: ((state: RecordingState) => void) | null = null;
  private _onDataAvailable: ((blob: Blob) => void) | null = null;
  private recordingStartTime = 0;
  private _highQuality = false;

  get state(): RecordingState {
    return this._state;
  }

  get highQuality(): boolean {
    return this._highQuality;
  }

  setHighQuality(enabled: boolean): void {
    this._highQuality = enabled;
  }

  onStateChange(cb: (state: RecordingState) => void): void {
    this._onStateChange = cb;
  }

  onDataAvailable(cb: (blob: Blob) => void): void {
    this._onDataAvailable = cb;
  }

  async requestMicAccess(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately — we just wanted to check permission
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: this._highQuality ? {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } : {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: this._highQuality ? 128000 : undefined,
      });
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this._onDataAvailable?.(blob);
        this._state = 'done';
        this._onStateChange?.('done');
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;
      };

      this.mediaRecorder.start(100); // collect data every 100ms
      this.recordingStartTime = Date.now();
      this._state = 'recording';
      this._onStateChange?.('recording');
      return true;
    } catch {
      this._state = 'idle';
      this._onStateChange?.('idle');
      return false;
    }
  }

  stop(): Blob | null {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    return null;
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.chunks = [];
    this._state = 'idle';
    this._onStateChange?.('idle');
  }

  getRecordingDuration(): number {
    if (this._state === 'recording') {
      return (Date.now() - this.recordingStartTime) / 1000;
    }
    return 0;
  }
}

export const recorderService = new RecorderService();
