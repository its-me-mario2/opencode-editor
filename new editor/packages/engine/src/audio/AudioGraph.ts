import type { AudioClipProperties, VocalEffect, NoiseReductionConfig, VoiceIsolationConfig } from '@opencode/shared';

export class AudioGraphNode {
  source: AudioBufferSourceNode | null = null;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  analyserNode: AnalyserNode;
  filters: BiquadFilterNode[] = [];
  convolver: ConvolverNode | null = null;
  destination: AudioNode;

  private ctx: AudioContext;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.panNode = ctx.createStereoPanner();
    this.analyserNode = ctx.createAnalyser();
    this.destination = destination;

    this.gainNode.connect(this.panNode);
    this.panNode.connect(this.analyserNode);
    this.analyserNode.connect(destination);
  }

  play(audioBuffer: AudioBuffer, startTime: number, offset: number, duration: number): void {
    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.start(startTime, offset, duration);
    source.connect(this.gainNode);
    this.source = source;
  }

  stop(): void {
    this.source?.stop();
    this.source = null;
  }

  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
  }

  setPan(pan: number): void {
    this.panNode.pan.setValueAtTime(pan, this.ctx.currentTime);
  }

  fadeIn(duration: number): void {
    const now = this.ctx.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(this.gainNode.gain.value, now + duration);
  }

  fadeOut(duration: number): void {
    const now = this.ctx.currentTime;
    const currentGain = this.gainNode.gain.value;
    this.gainNode.gain.setValueAtTime(currentGain, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
  }

  applyPitch(pitch: number): void {
    if (this.source) {
      this.source.playbackRate.setValueAtTime(pitch, this.ctx.currentTime);
    }
  }

  applyFilter(type: BiquadFilterType, frequency: number, q: number): BiquadFilterNode {
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    filter.Q.setValueAtTime(q, this.ctx.currentTime);

    this.disconnectChain();
    this.gainNode.disconnect();
    this.gainNode.connect(filter);
    filter.connect(this.panNode);
    this.filters.push(filter);
    return filter;
  }

  private disconnectChain(): void {
    for (const filter of this.filters) {
      filter.disconnect();
    }
    this.filters = [];
  }

  getAnalyserData(): Uint8Array {
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(data);
    return data;
  }

  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  dispose(): void {
    this.stop();
    this.disconnectChain();
    this.gainNode.disconnect();
    this.panNode.disconnect();
    this.analyserNode.disconnect();
  }
}

export class AudioGraph {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private masterAnalyser: AnalyserNode;
  private nodes: Map<string, AudioGraphNode>;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterAnalyser = ctx.createAnalyser();
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(ctx.destination);
    this.nodes = new Map();
  }

  createNode(id: string): AudioGraphNode {
    const node = new AudioGraphNode(this.ctx, this.masterGain);
    this.nodes.set(id, node);
    return node;
  }

  getNode(id: string): AudioGraphNode | undefined {
    return this.nodes.get(id);
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.dispose();
      this.nodes.delete(id);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
  }

  getMasterAnalyser(): AnalyserNode {
    return this.masterAnalyser;
  }

  getContext(): AudioContext {
    return this.ctx;
  }

  getCurrentTime(): number {
    return this.ctx.currentTime;
  }

  getSampleRate(): number {
    return this.ctx.sampleRate;
  }

  dispose(): void {
    for (const [id, node] of this.nodes) {
      node.dispose();
    }
    this.nodes.clear();
    this.masterGain.disconnect();
    this.masterAnalyser.disconnect();
  }
}
