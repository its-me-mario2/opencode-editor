export interface AIPipeline {
  name: string;
  modelPath: string;
  load: () => Promise<void>;
  infer: (input: unknown) => Promise<unknown>;
}

export class BackgroundRemovalPipeline implements AIPipeline {
  name = 'background-removal';
  modelPath = '../models/background-removal.onnx';

  async load(): Promise<void> {
    // Load ONNX model
  }

  async infer(input: ImageData): Promise<ImageData> {
    // Run segmentation model
    return input;
  }
}

export class TextToSpeechPipeline implements AIPipeline {
  name = 'text-to-speech';
  modelPath = '../models/tts.onnx';

  async load(): Promise<void> {}

  async infer(input: { text: string; voice: string }): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }
}

export class AutoCaptionPipeline implements AIPipeline {
  name = 'auto-caption';
  modelPath = '../models/whisper.onnx';

  async load(): Promise<void> {}

  async infer(input: AudioBuffer): Promise<{ text: string; segments: { start: number; end: number; text: string }[] }> {
    return { text: '', segments: [] };
  }
}
