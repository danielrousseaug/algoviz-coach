'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ZoomPanProps {
  width: number;
  height: number;
  minScale?: number;
  maxScale?: number;
  children: React.ReactNode;
}

export default function ZoomPan({
  width,
  height,
  minScale = 0.4,
  maxScale = 3,
  children,
}: ZoomPanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = -e.deltaY; // natural: scroll up to zoom in
    const zoomIntensity = 0.0015;
    const nextScale = clamp(scale * Math.exp(delta * zoomIntensity), minScale, maxScale);
    const scaleFactor = nextScale / scale;

    const newX = mouseX - (mouseX - translate.x) * scaleFactor;
    const newY = mouseY - (mouseY - translate.y) * scaleFactor;

    setScale(nextScale);
    setTranslate({ x: newX, y: newY });
  }, [scale, translate.x, translate.y, minScale, maxScale]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheel = (evt: WheelEvent) => handleWheel(evt);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel as any);
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ width: width, height: height, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="will-change-transform"
        style={{
          width,
          height,
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-1">
        <button
          aria-label="Zoom out"
          className="rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-foreground/90 hover:bg-white/10"
          onClick={() => setScale((s) => clamp(s * 0.9, minScale, maxScale))}
        >
          −
        </button>
        <button
          aria-label="Reset view"
          className="rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-foreground/90 hover:bg-white/10"
          onClick={reset}
        >
          ⟳
        </button>
        <button
          aria-label="Zoom in"
          className="rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-foreground/90 hover:bg-white/10"
          onClick={() => setScale((s) => clamp(s * 1.1, minScale, maxScale))}
        >
          +
        </button>
      </div>
    </div>
  );
}


