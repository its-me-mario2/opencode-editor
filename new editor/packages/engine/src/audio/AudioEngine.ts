import type { Clip, AudioClipProperties, VocalEffect } from '@opencode/shared';
import { AudioGraph, AudioGraphNode } from './AudioGraph';
import { BeatDetector } from './BeatDetector';

export class AudioEngine {
  private graph: AudioGraph;
  private beatDetector: BeatDetector;
  private ctx: AudioContext | null = null;

  constructor() {
    this.ctx = null;
    this.graph = null as unknown as AudioGraph;
    this.beatDetector = new BeatDetector();
  }

  async initialize(): Promise<void> {
    this.ctx = new AudioContext();
    this.graph = new AudioGraph(this.ctx);
  }

  getGraph(): AudioGraph {
    return this.graph;
  }

  getBeatDetector(): BeatDetector {
    return this.beatDetector;
  }

  async loadAudioClip(clip: Clip, audioData: ArrayBuffer): Promise<AudioGraphNode> {
    if (!this.ctx) throw new Error('Audio engine not initialized');

    const audioBuffer = await this.ctx.decodeAudioData(audioData);
    const node = this.graph.createNode(clip.id);

    if (clip.audio) {
      this.applyClipProperties(node, clip.audio);
    }

    node.play(audioBuffer, 0, 0, audioBuffer.duration);

    return node;
  }

  private applyClipProperties(node: AudioGraphNode, props: AudioClipProperties): void {
    node.setVolume(props.volume);
    node.setPan(props.pan);

    if (props.fadeIn > 0) node.fadeIn(props.fadeIn);
    if (props.fadeOut > 0) node.fadeOut(props.fadeOut);

    if (props.pitch !== 1) {
      node.applyPitch(props.pitch);
    }

    if (props.noiseReduction > 0) {
      node.applyFilter('lowpass', 4000, 1);
      node.applyFilter('highpass', 80, 1);
    }

    if (props.voiceIsolation) {
      node.applyFilter('bandpass', 1000, 0.5);
    }
  }

  applyVocalEffect(nodeId: string, effect: VocalEffect): void {
    const node = this.graph.getNode(nodeId);
    if (!node) return;

    switch (effect.type) {
      case 'robot':
        node.applyFilter('lowpass', 800, 5);
        break;
      case 'deep':
        node.applyFilter('lowshelf', 200, 3);
        break;
      case 'high':
        node.applyFilter('highshelf', 4000, 3);
        break;
      case 'echo':
        // Echo requires delay node; for simplicity use a comb filter
        node.applyFilter('lowpass', 2000, 10);
        break;
      case 'chipmunk':
        node.applyPitch(1.5);
        break;
    }
  }

  resume(): Promise<void> {
    return this.ctx?.resume() ?? Promise.resolve();
  }

  suspend(): Promise<void> {
    return this.ctx?.suspend() ?? Promise.resolve();
  }

  getContext(): AudioContext | undefined {
    return this.ctx ?? undefined;
  }

  dispose(): void {
    this.graph?.dispose();
    this.ctx?.close();
    this.ctx = null;
  }
}
