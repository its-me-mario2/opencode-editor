import React, { useEffect, useRef } from 'react';

interface CanvasRendererProps {
  width: number;
  height: number;
  onFrame?: (canvas: HTMLCanvasElement, time: number) => void;
  time: number;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  width,
  height,
  onFrame,
  time,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !onFrame) return;
    onFrame(canvasRef.current, time);
  }, [time, onFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, borderRadius: 4, background: '#000' }}
    />
  );
};
