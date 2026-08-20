import React, { useState, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  type: 'star' | 'dot' | 'streak' | 'glow';
  tx: number;
  ty: number;
  rot: number;
  angle: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface SparkleResumeButtonProps {
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  download?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children: React.ReactNode;
  id?: string;
  title?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

const CYAN_PALETTE = [
  '#00D2FF', // Electric Cyan
  '#38BDF8', // Sky Cyan
  '#06B6D4', // Deep Azure
  '#67E8F9', // Bright Glow Cyan
  '#FFFFFF', // Pure Sparkle White
  '#A5F3FC', // Icy Sparkle
];

export const SparkleResumeButton: React.FC<SparkleResumeButtonProps> = ({
  as = 'button',
  href,
  target,
  rel,
  download,
  onClick,
  className = '',
  children,
  id,
  title,
  style,
  type = 'button',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSparkles = useCallback(() => {
    // Generate 18 high-end particles
    const newParticles: Particle[] = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      // Balanced distribution around full circle with slight randomized jitter
      const baseAngle = (i / count) * 2 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 0.45;
      const distance = 24 + Math.random() * 46; // 24px to 70px

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 90; // -45deg to +45deg
      const streakAngle = (angle * 180) / Math.PI;

      // Particle Type Distribution:
      // ~40% 4-point stars, ~35% glowing dots, ~15% streaks, ~10% glow halos
      let type: Particle['type'] = 'dot';
      if (i % 3 === 0) type = 'star';
      else if (i % 5 === 0) type = 'streak';
      else if (i === 1 || i === 7) type = 'glow';

      const color = CYAN_PALETTE[Math.floor(Math.random() * CYAN_PALETTE.length)];
      const size = type === 'star' ? 10 + Math.random() * 4 : type === 'dot' ? 4 + Math.random() * 3 : type === 'streak' ? 14 + Math.random() * 8 : 18 + Math.random() * 8;
      const duration = 0.55 + Math.random() * 0.22; // 550ms - 770ms
      const delay = Math.random() * 0.05; // 0ms - 50ms

      newParticles.push({
        id: Date.now() + i,
        type,
        tx,
        ty,
        rot,
        angle: streakAngle,
        size,
        color,
        duration,
        delay,
      });
    }

    setParticles(newParticles);
    setIsPulsing(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setParticles([]);
      setIsPulsing(false);
    }, 800);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    triggerSparkles();
    if (onClick) {
      onClick(e);
    }
  };

  const commonProps = {
    id,
    title,
    style,
    onClick: handleClick,
    className: `sparkle-btn-wrapper ${isPulsing ? 'sparkle-pulse-active' : ''} ${className}`,
  };

  return (
    <>
      {as === 'a' ? (
        <a
          ref={(el) => {
            containerRef.current = el;
          }}
          href={href}
          target={target}
          rel={rel}
          download={download}
          {...commonProps}
        >
          {children}
          {renderParticles(particles)}
        </a>
      ) : (
        <button
          ref={(el) => {
            containerRef.current = el;
          }}
          type={type}
          {...commonProps}
        >
          {children}
          {renderParticles(particles)}
        </button>
      )}
    </>
  );
};

// Render Sparkle Particle Overlays
function renderParticles(particles: Particle[]) {
  if (!particles.length) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const style: React.CSSProperties = {
          left: '50%',
          top: '50%',
          width: p.size,
          height: p.size,
          // CSS variables passed to keyframes
          ['--tx' as any]: `${p.tx}px`,
          ['--ty' as any]: `${p.ty}px`,
          ['--rot' as any]: `${p.rot}deg`,
          ['--angle' as any]: `${p.angle}deg`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          animationFillMode: 'forwards',
        };

        if (p.type === 'star') {
          return (
            <div
              key={p.id}
              className="sparkle-particle"
              style={{
                ...style,
                animationName: 'sparkleStarAnim',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill={p.color}
                style={{
                  width: '100%',
                  height: '100%',
                  filter: `drop-shadow(0 0 6px ${p.color})`,
                }}
              >
                {/* 4-point star sparkle */}
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z" />
              </svg>
            </div>
          );
        }

        if (p.type === 'streak') {
          return (
            <div
              key={p.id}
              className="sparkle-particle"
              style={{
                ...style,
                height: '2px',
                width: `${p.size}px`,
                background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                boxShadow: `0 0 8px ${p.color}`,
                borderRadius: '1px',
                animationName: 'sparkleStreakAnim',
              }}
            />
          );
        }

        if (p.type === 'glow') {
          return (
            <div
              key={p.id}
              className="sparkle-particle"
              style={{
                ...style,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${p.color} 0%, rgba(0,210,255,0) 70%)`,
                filter: 'blur(3px)',
                animationName: 'sparkleGlowOrbAnim',
              }}
            />
          );
        }

        // Default: glowing dot
        return (
          <div
            key={p.id}
            className="sparkle-particle"
            style={{
              ...style,
              borderRadius: '50%',
              backgroundColor: p.color,
              boxShadow: `0 0 6px 1px ${p.color}, 0 0 12px ${p.color}`,
              animationName: 'sparkleDotAnim',
            }}
          />
        );
      })}
    </div>
  );
}
