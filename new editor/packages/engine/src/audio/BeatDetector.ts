import type { BeatMarker } from '@opencode/shared';

export class BeatDetector {
  async detectBeats(audioBuffer: AudioBuffer): Promise<BeatMarker[]> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const beats: BeatMarker[] = [];

    const frameSize = Math.floor(sampleRate * 0.023); // ~23ms frames
    const hopSize = Math.floor(frameSize / 2);

    const numFrames = Math.floor((channelData.length - frameSize) / hopSize);
    const energyHistory: number[] = [];
    const energyBufferSize = 43;

    for (let i = 0; i < numFrames; i++) {
      const offset = i * hopSize;
      let energy = 0;

      for (let j = 0; j < frameSize; j++) {
        energy += channelData[offset + j]! ** 2;
      }
      energy /= frameSize;

      energyHistory.push(energy);
      if (energyHistory.length > energyBufferSize) {
        energyHistory.shift();
      }

      if (energyHistory.length === energyBufferSize) {
        const avgEnergy =
          energyHistory.reduce((a, b) => a + b, 0) / energyBufferSize;
        const variance =
          energyHistory.reduce((sum, e) => sum + (e - avgEnergy) ** 2, 0) /
          energyBufferSize;
        const threshold = avgEnergy + variance * 1.5;

        if (energy > threshold && energy > avgEnergy * 2.5) {
          const time = offset / sampleRate;
          beats.push({
            time,
            index: beats.length,
            strength: Math.min(1, (energy - threshold) / threshold),
          });
        }
      }
    }

    return this.filterBeatDurations(beats);
  }

  private filterBeatDurations(beats: BeatMarker[]): BeatMarker[] {
    if (beats.length < 2) return beats;

    const filtered: BeatMarker[] = [beats[0]!];
    let minGap = 0.1;

    for (let i = 1; i < beats.length; i++) {
      const gap = beats[i]!.time - filtered[filtered.length - 1]!.time;
      if (gap >= minGap) {
        filtered.push(beats[i]!);
      }
    }

    return filtered;
  }

  async extractAudioFromVideo(videoFile: File): Promise<AudioBuffer | null> {
    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }
}
