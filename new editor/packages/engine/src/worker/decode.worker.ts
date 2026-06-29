self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data;

  if (type === 'initDecoder') {
    try {
      const { config } = payload as { config: VideoDecoderConfig };
      const decoder = new VideoDecoder({
        output: (frame) => {
          const buffer = new ArrayBuffer(frame.allocationSize());
          frame.copyTo(buffer);
          self.postMessage(
            { type: 'frame', data: buffer, timestamp: frame.timestamp, duration: frame.duration },
            { transfer: [buffer] },
          );
          frame.close();
        },
        error: (error) => {
          self.postMessage({ type: 'error', error: error.message });
        },
      });
      decoder.configure(config);
      self.postMessage({ id, type: 'initialized' });
    } catch (error) {
      self.postMessage({ id, type: 'error', error: String(error) });
    }
  }

  if (type === 'decode') {
    const { chunkData, chunkType, timestamp, duration } = payload as {
      chunkData: Uint8Array;
      chunkType: EncodedVideoChunkType;
      timestamp: number;
      duration: number;
    };
    const chunk = new EncodedVideoChunk({
      type: chunkType,
      data: chunkData,
      timestamp: Math.round(timestamp),
      duration: Math.round(duration),
    });
    self.postMessage({ type: 'decoded', id });
  }
};
