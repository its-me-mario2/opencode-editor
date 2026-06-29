self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data;

  if (type === 'generateProxy') {
    try {
      const { file, config } = payload as {
        file: File;
        config: { width: number; height: number; bitrate: number; fps: number };
      };

      // FFmpeg.wasm proxy generation would run here
      // For the scaffold, we pass through the file as-is
      const blob = file.slice(0, file.size, file.type);

      self.postMessage(
        { id, type: 'complete', data: blob },
        { transfer: [blob] },
      );
    } catch (error) {
      self.postMessage({ id, type: 'error', error: String(error) });
    }
  }
};
