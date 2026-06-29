export function framesToTime(frames: number, fps: number): number {
  return frames / fps;
}

export function timeToFrames(time: number, fps: number): number {
  return Math.round(time * fps);
}

export function formatTime(seconds: number, fps: number): string {
  const frames = Math.round(seconds * fps);
  const totalSeconds = Math.floor(frames / fps);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const f = frames % fps;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${f.toString().padStart(2, '0')}`;
}

export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return parseFloat(parts[0]!) * 3600 + parseFloat(parts[1]!) * 60 + parseFloat(parts[2]!);
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]!) * 60 + parseFloat(parts[1]!);
  }
  return parseFloat(timeStr);
}

export function snapTime(time: number, fps: number): number {
  return Math.round(time * fps) / fps;
}

export function clampTime(time: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, time));
}
