import { useEffect, useRef, useCallback } from 'react';
import { useTimelineStore } from '../stores/timelineStore';
import { useUIStore } from '../stores/uiStore';

export function usePlayback(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animFrameRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const currentTime = useTimelineStore((s) => s.currentTime);
  const duration = useTimelineStore((s) => s.duration);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const playbackState = useUIStore((s) => s.playbackState);
  const setPlaybackState = useUIStore((s) => s.setPlaybackState);

  const fps = 30;
  const frameDuration = 1000 / fps;

  const play = useCallback(() => {
    setPlaybackState('playing');
  }, [setPlaybackState]);

  const pause = useCallback(() => {
    setPlaybackState('paused');
    cancelAnimationFrame(animFrameRef.current);
  }, [setPlaybackState]);

  const stop = useCallback(() => {
    setPlaybackState('stopped');
    setCurrentTime(0);
    cancelAnimationFrame(animFrameRef.current);
  }, [setPlaybackState, setCurrentTime]);

  const togglePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      pause();
    } else {
      play();
    }
  }, [playbackState, play, pause]);

  useEffect(() => {
    if (playbackState !== 'playing') return;

    let running = true;
    const tick = (timestamp: number) => {
      if (!running) return;

      const delta = timestamp - lastFrameTime.current;
      if (delta >= frameDuration) {
        lastFrameTime.current = timestamp - (delta % frameDuration);

        setCurrentTime(Math.min(currentTime + 1 / fps, duration));

        if (currentTime >= duration) {
          setPlaybackState('stopped');
          setCurrentTime(0);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    lastFrameTime.current = performance.now();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [playbackState, currentTime, duration, fps, setCurrentTime, setPlaybackState]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { play, pause, stop, togglePlayPause, currentTime };
}
