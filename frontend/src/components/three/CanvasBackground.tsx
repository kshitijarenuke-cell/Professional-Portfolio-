import React, { useEffect, useRef } from 'react';
import { FluidHeroEngine } from '../../three/FluidHeroEngine';
import type { Theme } from '../../types';

interface CanvasBackgroundProps {
  scrollProgress: number;
  theme: Theme;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  scrollProgress,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FluidHeroEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new FluidHeroEngine(containerRef.current, theme);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update theme
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(theme);
    }
  }, [theme]);

  // Update scroll progress
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setScrollProgress(scrollProgress);
    }
  }, [scrollProgress]);

  return (
    <div
      id="webgl-fluid-container"
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    />
  );
};
