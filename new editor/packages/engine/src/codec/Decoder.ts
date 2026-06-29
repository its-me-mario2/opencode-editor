export type DecoderState = 'idle' | 'decoding' | 'paused' | 'ended' | 'error';

export interface DecodedFrame {
  frame: VideoFrame;
  timestamp: number;
  duration: number;
}

export class VideoDecoderEngine {
  private decoder: VideoDecoder | null = null;
  private state: DecoderState = 'idle';
  private config: VideoDecoderConfig | null = null;
  private pendingFrames: DecodedFrame[] = [];
  private maxCacheSize: number = 120;

  onFrame: ((frame: DecodedFrame) => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  async initialize(config: VideoDecoderConfig): Promise<void> {
    this.config = config;

    this.decoder = new VideoDecoder({
      output: (frame) => this.handleFrame(frame),
      error: (error) => {
        this.state = 'error';
        this.onError?.(error);
      },
    });

    this.decoder.configure(config);
    this.state = 'idle';
  }

  decode(chunk: EncodedVideoChunk): void {
    if (!this.decoder || this.state === 'error') return;
    this.state = 'decoding';
    this.decoder.decode(chunk);
  }

  async flush(): Promise<void> {
    if (!this.decoder) return;
    await this.decoder.flush();
    this.state = 'ended';
  }

  reset(): void {
    this.decoder?.reset();
    this.pendingFrames = [];
    this.state = 'idle';
    if (this.config) {
      this.decoder?.configure(this.config);
    }
  }

  close(): void {
    this.decoder?.close();
    this.decoder = null;
    this.pendingFrames = [];
    this.state = 'idle';
  }

  getState(): DecoderState {
    return this.state;
  }

  getDecodeQueueSize(): number {
    return this.decoder?.decodeQueueSize ?? 0;
  }

  private handleFrame(frame: VideoFrame): void {
    const decoded: DecodedFrame = {
      frame,
      timestamp: frame.timestamp! / 1_000_000,
      duration: frame.duration! / 1_000_000,
    };

    this.pendingFrames.push(decoded);

    if (this.pendingFrames.length > this.maxCacheSize) {
      const removed = this.pendingFrames.shift()!;
      removed.frame.close();
    }

    this.onFrame?.(decoded);
  }

  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    while (this.pendingFrames.length > this.maxCacheSize) {
      this.pendingFrames.shift()!.frame.close();
    }
  }

  getCachedFrames(): DecodedFrame[] {
    return this.pendingFrames;
  }

  static isWebCodecsSupported(): boolean {
    return typeof VideoDecoder !== 'undefined' && typeof VideoEncoder !== 'undefined';
  }
}
