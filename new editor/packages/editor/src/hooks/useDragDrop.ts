import { useEffect, useRef, useCallback } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

interface DragState {
  isDragging: boolean;
  type: 'clip' | 'trim-left' | 'trim-right' | 'keyframe' | 'track';
  clipId: string | null;
  startX: number;
  startY: number;
  originalStart: number;
  originalEnd: number;
}

export function useDragDrop(containerRef: React.RefObject<HTMLDivElement | null>) {
  const dragState = useRef<DragState>({
    isDragging: false,
    type: 'clip',
    clipId: null,
    startX: 0,
    startY: 0,
    originalStart: 0,
    originalEnd: 0,
  });

  const zoom = useTimelineStore((s) => s.zoom);
  const snapEnabled = useTimelineStore((s) => s.snapEnabled);
  const moveClip = useTimelineStore((s) => s.moveClip);
  const splitClip = useTimelineStore((s) => s.splitClip);
  const setDragState = useTimelineStore((s) => s.setDragState);

  const startDrag = useCallback(
    (
      e: React.PointerEvent,
      type: DragState['type'],
      clipId: string,
      originalStart: number,
      originalEnd: number,
    ) => {
      e.preventDefault();
      dragState.current = {
        isDragging: true,
        type,
        clipId,
        startX: e.clientX,
        startY: e.clientY,
        originalStart,
        originalEnd,
      };
      const mappedType = type === 'trim-left' || type === 'trim-right' ? 'trim' : type === 'track' ? 'clip' : type;
      setDragState({ type: mappedType, id: clipId });
    },
    [setDragState],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.current.isDragging) return;
      const { type, clipId, startX, originalStart, originalEnd } = dragState.current;
      if (!clipId) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dx = (e.clientX - startX) / zoom;
      const pixelsPerSecond = 100 * zoom;
      const deltaSeconds = (e.clientX - startX) / pixelsPerSecond;

      if (type === 'clip') {
        const newStart = Math.max(0, originalStart + deltaSeconds);
        moveClip(clipId, snapEnabled ? snapTime(newStart) : newStart);
      } else if (type === 'trim-left') {
        const newStart = Math.max(0, originalStart + deltaSeconds);
        if (newStart < originalEnd - 0.033) {
          moveClip(clipId, snapEnabled ? snapTime(newStart) : newStart);
        }
      } else if (type === 'trim-right') {
        const newEnd = originalEnd + deltaSeconds;
        if (newEnd > originalStart + 0.033) {
          // update end through moveClip (extend)
        }
      }
    },
    [containerRef, zoom, snapEnabled, moveClip],
  );

  const handlePointerUp = useCallback(() => {
    if (dragState.current.isDragging) {
      dragState.current.isDragging = false;
      setDragState({ type: 'none' as const, id: null });
    }
  }, [setDragState]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return { startDrag };
}

function snapTime(time: number): number {
  return Math.round(time * 30) / 30;
}
