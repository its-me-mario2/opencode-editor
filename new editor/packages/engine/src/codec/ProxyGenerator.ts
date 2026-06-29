export interface ProxyConfig {
  width: number;
  height: number;
  bitrate: number;
  fps: number;
}

export const PROXY_PRESETS: Record<string, ProxyConfig> = {
  '1080p': { width: 1920, height: 1080, bitrate: 2_000_000, fps: 30 },
  '720p': { width: 1280, height: 720, bitrate: 1_000_000, fps: 30 },
  '540p': { width: 960, height: 540, bitrate: 500_000, fps: 30 },
  '360p': { width: 640, height: 360, bitrate: 300_000, fps: 30 },
};

export class ProxyGenerator {
  private worker: Worker | null = null;

  async init(): Promise<void> {
    // FFmpeg.wasm worker for proxy generation
    this.worker = new Worker(
      new URL('../worker/proxy.worker.ts', import.meta.url),
      { type: 'module' },
    );
  }

  generateProxy(
    sourceFile: File,
    preset: ProxyConfig = PROXY_PRESETS['540p']!,
    onProgress?: (percent: number) => void,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Proxy worker not initialized'));
        return;
      }

      this.worker.postMessage({
        type: 'generateProxy',
        file: sourceFile,
        config: preset,
      });

      this.worker.onmessage = (event) => {
        const { type, data, progress, error } = event.data;
        switch (type) {
          case 'progress':
            onProgress?.(progress);
            break;
          case 'complete':
            resolve(data);
            break;
          case 'error':
            reject(new Error(error));
            break;
        }
      };
    });
  }

  cancel(): void {
    this.worker?.postMessage({ type: 'cancel' });
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
