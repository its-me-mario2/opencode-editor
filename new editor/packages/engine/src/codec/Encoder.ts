import type { ExportSettings } from '@opencode/shared';

export type EncoderState = 'idle' | 'encoding' | 'complete' | 'error';

export interface EncodedChunk {
  data: Uint8Array;
  type: 'key' | 'delta';
  timestamp: number;
}

export class VideoEncoderEngine {
  private encoder: VideoEncoder | null = null;
  private state: EncoderState = 'idle';
  private chunks: EncodedChunk[] = [];
  private config: VideoEncoderConfig | null = null;

  onChunk: ((chunk: EncodedChunk) => void) | null = null;
  onComplete: (() => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  async initialize(settings: ExportSettings, width: number, height: number): Promise<void> {
    const codecMap: Record<string, string> = {
      h264: 'avc1.42001E',
      hevc: 'hvc1.1.6.L93.90',
      vp9: 'vp09.00.10.08',
      av1: 'av01.0.04M.08',
    };

    const codec = codecMap[settings.codec] ?? 'avc1.42001E';

    this.config = {
      codec,
      width,
      height,
      bitrate: settings.bitrate,
      framerate: settings.fps,
    };

    this.chunks = [];

    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        const buffer = new Uint8Array(chunk.byteLength);
        chunk.copyTo(buffer);
        const encoded: EncodedChunk = {
          data: buffer,
          type: chunk.type,
          timestamp: chunk.timestamp,
        };
        this.chunks.push(encoded);
        this.onChunk?.(encoded);
      },
      error: (error) => {
        this.state = 'error';
        this.onError?.(error);
      },
    });

    this.encoder.configure(this.config);
    this.state = 'idle';
  }

  encode(frame: VideoFrame): void {
    if (!this.encoder || this.state === 'error') return;
    this.state = 'encoding';
    this.encoder.encode(frame);
  }

  async flush(): Promise<void> {
    if (!this.encoder) return;
    await this.encoder.flush();
    this.state = 'complete';
    this.onComplete?.();
  }

  close(): void {
    this.encoder?.close();
    this.encoder = null;
    this.state = 'idle';
  }

  getChunks(): EncodedChunk[] {
    return this.chunks;
  }

  getState(): EncoderState {
    return this.state;
  }

  getPendingOps(): number {
    return this.encoder?.encodeQueueSize ?? 0;
  }
}
