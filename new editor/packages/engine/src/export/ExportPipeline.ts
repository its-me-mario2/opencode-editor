import type {
  ExportSettings,
  ExportProgress,
  TimelineState,
  Clip,
} from '@opencode/shared';
import { VideoEncoderEngine } from '../codec/Encoder';

export interface MuxedOutput {
  blob: Blob;
  duration: number;
  size: number;
}

export class ExportPipeline {
  private encoder: VideoEncoderEngine | null = null;
  private cancelled: boolean = false;
  private onProgress: ((progress: ExportProgress) => void) | null = null;

  setOnProgress(callback: (progress: ExportProgress) => void): void {
    this.onProgress = callback;
  }

  async export(
    settings: ExportSettings,
    timeline: TimelineState,
    frameSupplier: (time: number) => Promise<VideoFrame | null>,
    audioSupplier: () => Promise<AudioBuffer | null>,
  ): Promise<MuxedOutput> {
    this.cancelled = false;

    const { width, height } = this.getResolution(settings.resolution);
    const totalFrames = Math.round((timeline.duration) * settings.fps);
    const startFrame = Math.round(settings.startTime * settings.fps);
    const endFrame = Math.round(settings.endTime * settings.fps);

    this.encoder = new VideoEncoderEngine();
    await this.encoder.initialize(settings, width, height);

    const encodedChunks: Uint8Array[] = [];

    this.encoder.onChunk = (chunk) => {
      encodedChunks.push(chunk.data);
    };

    for (let frame = startFrame; frame <= endFrame && !this.cancelled; frame++) {
      const time = frame / settings.fps;
      const videoFrame = await frameSupplier(time);

      if (videoFrame) {
        this.encoder.encode(videoFrame);
        videoFrame.close();
      }

      if (frame % Math.max(1, Math.floor((endFrame - startFrame) / 100)) === 0) {
        const percent = ((frame - startFrame) / (endFrame - startFrame)) * 100;
        this.onProgress?.({
          phase: 'encoding',
          percent: Math.round(percent),
          fps: settings.fps,
          eta: (endFrame - frame) / settings.fps,
        });
      }
    }

    await this.encoder.flush();
    const chunks = this.encoder.getChunks();

    const blob = await this.muxToMp4(chunks, settings.codec);

    this.onProgress?.({
      phase: 'complete',
      percent: 100,
      fps: 0,
      eta: 0,
    });

    return {
      blob,
      duration: timeline.duration,
      size: blob.size,
    };
  }

  cancel(): void {
    this.cancelled = true;
  }

  private async muxToMp4(
    chunks: { data: Uint8Array; type: 'key' | 'delta'; timestamp: number }[],
    codec: string,
  ): Promise<Blob> {
    // MP4Box.js or similar muxing would happen here
    // For now, concatenate raw chunks into a blob
    const totalSize = chunks.reduce((sum, c) => sum + c.data.length, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk.data, offset);
      offset += chunk.data.length;
    }

    const mimeType = codec === 'vp9' ? 'video/webm' : 'video/mp4';
    return new Blob([combined], { type: mimeType });
  }

  private getResolution(res: string): { width: number; height: number } {
    switch (res) {
      case '1080p': return { width: 1920, height: 1080 };
      case '1440p': return { width: 2560, height: 1440 };
      case '2160p': return { width: 3840, height: 2160 };
      case '4320p': return { width: 7680, height: 4320 };
      default: return { width: 1920, height: 1080 };
    }
  }

  dispose(): void {
    this.encoder?.close();
    this.encoder = null;
  }
}
