'use client';

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';

export default function PhysicalPoster({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const frame = useRef<number | null>(null);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const reset = (event: PointerEvent<HTMLDivElement>) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const element = event.currentTarget;
    element.removeAttribute('data-illuminated');
    for (const property of ['--poster-rx', '--poster-ry', '--poster-light-x', '--poster-light-y', '--poster-shadow-x']) {
      element.style.removeProperty(property);
    }
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      element.dataset.illuminated = 'true';
      element.style.setProperty('--poster-rx', `${(0.5 - y) * 14}deg`);
      element.style.setProperty('--poster-ry', `${(x - 0.5) * 14}deg`);
      element.style.setProperty('--poster-light-x', `${x * 100}%`);
      element.style.setProperty('--poster-light-y', `${y * 100}%`);
      element.style.setProperty('--poster-shadow-x', `${(0.5 - x) * 16}px`);
    });
  };

  return <div className="cinema-poster-mount" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <div className="cinema-poster-print">{children}</div>
    {overlay}
  </div>;
}
