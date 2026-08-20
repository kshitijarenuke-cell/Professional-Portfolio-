import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BurstParticle {
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

interface HoverParticle {
  id: number;
  type: 'star' | 'dot' | 'streak';
  hx: number;
  hy: number;
  hrot: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  leftPercent: number;
  topPercent: number;
  opacity: number;
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
  pdfUrl?: string;
  pdfFileName?: string;
}

const CYAN_PALETTE = [
  '#00D2FF', // Electric Cyan
  '#38BDF8', // Sky Cyan
  '#06B6D4', // Deep Azure
  '#67E8F9', // Bright Glow Cyan
  '#FFFFFF', // Pure Sparkle White
  '#A5F3FC', // Icy Sparkle
  '#7DD3FC', // Vivid Sky
];

const DEFAULT_RESUME_PATH = '/resume/Kshitija-Renuke-Resume.pdf';
const DEFAULT_RESUME_NAME = 'Kshitija-Renuke-Resume.pdf';

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
  pdfUrl = DEFAULT_RESUME_PATH,
  pdfFileName = DEFAULT_RESUME_NAME,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverParticles, setHoverParticles] = useState<HoverParticle[]>([]);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPulsing, setIsPulsing] = useState(false);

  const buttonRef = useRef<HTMLElement | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate 24 Dense Hover Sparkles on Mouse Enter (spread on all 4 sides X: -45px to +45px, Y: -35px to +35px)
  const handleMouseEnter = () => {
    setIsHovered(true);
    const newHover: HoverParticle[] = [];
    const count = 24; // 24 continuously twinkling hover particles (range 18–28)

    for (let i = 0; i < count; i++) {
      // Balanced placement covering all 4 sides of the button
      // Quad 0: Top, Quad 1: Right, Quad 2: Bottom, Quad 3: Left, plus interior
      const side = i % 4;
      let leftPercent = 50;
      let topPercent = 50;

      if (side === 0) {
        // Top edge with outward spread
        leftPercent = 5 + Math.random() * 90;
        topPercent = -15 - Math.random() * 30;
      } else if (side === 1) {
        // Right edge
        leftPercent = 95 + Math.random() * 35;
        topPercent = 5 + Math.random() * 90;
      } else if (side === 2) {
        // Bottom edge
        leftPercent = 5 + Math.random() * 90;
        topPercent = 95 + Math.random() * 35;
      } else {
        // Left edge
        leftPercent = -15 - Math.random() * 30;
        topPercent = 5 + Math.random() * 90;
      }

      // Random micro-offset travel distance (-45px to +45px X, -35px to +35px Y)
      const hx = (Math.random() - 0.5) * 35;
      const hy = (Math.random() - 0.5) * 28;
      const hrot = (Math.random() - 0.5) * 90;

      let type: HoverParticle['type'] = 'dot';
      if (i % 3 === 0) type = 'star';
      else if (i % 5 === 0) type = 'streak';

      const color = CYAN_PALETTE[Math.floor(Math.random() * CYAN_PALETTE.length)];
      // Size variety: some tiny/dim (2–3px), some medium (4–6px), some prominent (8–10px)
      const size = type === 'star' ? (i % 2 === 0 ? 8 + Math.random() * 3 : 5 + Math.random() * 2) : type === 'dot' ? (i % 2 === 0 ? 2 + Math.random() * 2 : 4 + Math.random() * 2) : 10 + Math.random() * 6;
      
      const duration = 1.3 + Math.random() * 1.1; // 1.3s - 2.4s
      const delay = Math.random() * 1.5; // Staggered 0s - 1.5s so particles don't flash in sync
      const opacity = 0.45 + Math.random() * 0.5;

      newHover.push({
        id: i,
        type,
        hx,
        hy,
        hrot,
        size,
        color,
        duration,
        delay,
        leftPercent,
        topPercent,
        opacity,
      });
    }
    setHoverParticles(newHover);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverParticles([]);
  };

  // Trigger Strong Radial Click Sparkle Burst (44 particles in all 360° directions)
  const triggerClickSparkleBurst = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setBurstOrigin({ x: centerX, y: centerY });

    const newBurst: BurstParticle[] = [];
    const count = 44; // 44 rich radial particles (range 35–50)

    for (let i = 0; i < count; i++) {
      // 360-degree radial distribution in all 8 directions (↖ ↑ ↗ ← BUTTON → ↙ ↓ ↘)
      const baseAngle = (i / count) * 2 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 0.32;

      // Tiered distance: higher density close to button (40-75px), outer trail (80-125px)
      const isFar = i % 3 === 0;
      const distance = isFar ? 75 + Math.random() * 48 : 38 + Math.random() * 42;

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 180;
      const streakAngle = (angle * 180) / Math.PI;

      let type: BurstParticle['type'] = 'dot';
      if (i % 3 === 0) type = 'star';
      else if (i % 6 === 0) type = 'streak';
      else if (i === 1 || i === 9 || i === 18 || i === 27 || i === 36) type = 'glow';

      const color = CYAN_PALETTE[Math.floor(Math.random() * CYAN_PALETTE.length)];

      // Size tiers: Small (2–3px), Medium (4–6px), Occasional prominent sparkle (8–13px)
      let size = 3;
      if (type === 'star') {
        size = i % 2 === 0 ? 9 + Math.random() * 4 : 5 + Math.random() * 3;
      } else if (type === 'dot') {
        size = i % 2 === 0 ? 2.5 + Math.random() * 1.5 : 4.5 + Math.random() * 2;
      } else if (type === 'streak') {
        size = 16 + Math.random() * 10;
      } else {
        size = 22 + Math.random() * 10;
      }

      const duration = 0.68 + Math.random() * 0.30; // 680ms - 980ms
      const delay = Math.random() * 0.055; // 0ms - 55ms

      newBurst.push({
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

    setBurstParticles(newBurst);
    setIsPulsing(true);

    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => {
      setBurstParticles([]);
      setIsPulsing(false);
    }, 1050);
  }, []);

  // Programmatic PDF Download Trigger
  const triggerResumeDownload = useCallback(() => {
    const targetUrl = href || pdfUrl || DEFAULT_RESUME_PATH;
    const targetName = download || pdfFileName || DEFAULT_RESUME_NAME;

    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = targetName;
      link.target = '_blank';
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('[Resume Download Error]', e);
      window.open(targetUrl, '_blank');
    }
  }, [href, pdfUrl, download, pdfFileName]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // 1. Instantly trigger visual sparkle burst
    triggerClickSparkleBurst();

    // 2. Call custom onClick if passed
    if (onClick) {
      onClick(e);
    }

    // 3. Prevent immediate default navigation if it's an <a> tag so animation is fully seen
    if (as === 'a') {
      e.preventDefault();
    }

    // 4. Schedule controlled download after ~550ms so user visibly sees sparkle burst
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = setTimeout(() => {
      triggerResumeDownload();
    }, 550);
  };

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    };
  }, []);

  const commonProps = {
    id,
    title,
    style,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: `sparkle-btn-wrapper ${isPulsing ? 'sparkle-pulse-active' : ''} ${className}`,
  };

  return (
    <>
      {as === 'a' ? (
        <a
          ref={(el) => {
            buttonRef.current = el;
          }}
          href={href || DEFAULT_RESUME_PATH}
          target={target || '_blank'}
          rel={rel || 'noreferrer'}
          download={download || DEFAULT_RESUME_NAME}
          {...commonProps}
        >
          {/* Subtle Hover Aura behind button */}
          {isHovered && <div className="sparkle-hover-aura" />}
          <span className="relative z-10 flex items-center gap-1.5">{children}</span>
          {/* Local Hover Sparkles */}
          {isHovered && renderHoverParticles(hoverParticles)}
        </a>
      ) : (
        <button
          ref={(el) => {
            buttonRef.current = el;
          }}
          type={type}
          {...commonProps}
        >
          {/* Subtle Hover Aura behind button */}
          {isHovered && <div className="sparkle-hover-aura" />}
          <span className="relative z-10 flex items-center gap-1.5">{children}</span>
          {/* Local Hover Sparkles */}
          {isHovered && renderHoverParticles(hoverParticles)}
        </button>
      )}

      {/* Global Viewport Portal for Click Sparkle Burst (NEVER clipped by overflow:hidden) */}
      {typeof document !== 'undefined' &&
        burstParticles.length > 0 &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: burstOrigin.x,
              top: burstOrigin.y,
              width: 0,
              height: 0,
              pointerEvents: 'none',
              zIndex: 999999,
              overflow: 'visible',
            }}
            aria-hidden="true"
          >
            {burstParticles.map((p) => {
              const particleStyle: React.CSSProperties = {
                position: 'absolute',
                left: 0,
                top: 0,
                width: p.size,
                height: p.size,
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
                      ...particleStyle,
                      animationName: 'sparkleStarAnim',
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={p.color}
                      style={{
                        width: '100%',
                        height: '100%',
                        filter: `drop-shadow(0 0 8px ${p.color}) drop-shadow(0 0 14px ${p.color})`,
                      }}
                    >
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
                      ...particleStyle,
                      height: '2.5px',
                      width: `${p.size}px`,
                      background: `linear-gradient(90deg, transparent, ${p.color}, #FFFFFF, transparent)`,
                      boxShadow: `0 0 10px ${p.color}, 0 0 16px ${p.color}`,
                      borderRadius: '2px',
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
                      ...particleStyle,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${p.color} 0%, rgba(0,210,255,0.4) 50%, rgba(0,210,255,0) 70%)`,
                      filter: 'blur(3px)',
                      animationName: 'sparkleGlowOrbAnim',
                    }}
                  />
                );
              }

              return (
                <div
                  key={p.id}
                  className="sparkle-particle"
                  style={{
                    ...particleStyle,
                    borderRadius: '50%',
                    backgroundColor: p.color,
                    boxShadow: `0 0 8px 2px ${p.color}, 0 0 16px 4px ${p.color}`,
                    animationName: 'sparkleDotAnim',
                  }}
                />
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

// Render Local Hover Sparkles
function renderHoverParticles(particles: HoverParticle[]) {
  if (!particles.length) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${p.leftPercent}%`,
          top: `${p.topPercent}%`,
          width: p.size,
          height: p.size,
          ['--hx' as any]: `${p.hx}px`,
          ['--hy' as any]: `${p.hy}px`,
          ['--hrot' as any]: `${p.hrot}deg`,
          animation: `hoverSparkleTwinkle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          pointerEvents: 'none',
          opacity: p.opacity,
        };

        if (p.type === 'star') {
          return (
            <div key={p.id} style={style}>
              <svg
                viewBox="0 0 24 24"
                fill={p.color}
                style={{
                  width: '100%',
                  height: '100%',
                  filter: `drop-shadow(0 0 5px ${p.color})`,
                }}
              >
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z" />
              </svg>
            </div>
          );
        }

        if (p.type === 'streak') {
          return (
            <div
              key={p.id}
              style={{
                ...style,
                height: '1.5px',
                width: `${p.size}px`,
                background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                boxShadow: `0 0 6px ${p.color}`,
                borderRadius: '1px',
              }}
            />
          );
        }

        return (
          <div
            key={p.id}
            style={{
              ...style,
              borderRadius: '50%',
              backgroundColor: p.color,
              boxShadow: `0 0 6px 1px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
}
