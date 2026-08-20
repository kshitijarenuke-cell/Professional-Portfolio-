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
  '#BAE6FD', // Luminous Light Blue
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

  // Hover Effect: 24 continuously twinkling particles spread around all 4 sides
  const handleMouseEnter = () => {
    setIsHovered(true);
    const newHover: HoverParticle[] = [];
    const count = 24;

    for (let i = 0; i < count; i++) {
      const side = i % 4;
      let leftPercent = 50;
      let topPercent = 50;

      if (side === 0) {
        leftPercent = 5 + Math.random() * 90;
        topPercent = -15 - Math.random() * 30;
      } else if (side === 1) {
        leftPercent = 95 + Math.random() * 35;
        topPercent = 5 + Math.random() * 90;
      } else if (side === 2) {
        leftPercent = 5 + Math.random() * 90;
        topPercent = 95 + Math.random() * 35;
      } else {
        leftPercent = -15 - Math.random() * 30;
        topPercent = 5 + Math.random() * 90;
      }

      const hx = (Math.random() - 0.5) * 35;
      const hy = (Math.random() - 0.5) * 28;
      const hrot = (Math.random() - 0.5) * 90;

      let type: HoverParticle['type'] = 'dot';
      if (i % 3 === 0) type = 'star';
      else if (i % 5 === 0) type = 'streak';

      const color = CYAN_PALETTE[Math.floor(Math.random() * CYAN_PALETTE.length)];
      const size = type === 'star' ? (i % 2 === 0 ? 8 + Math.random() * 3 : 5 + Math.random() * 2) : type === 'dot' ? (i % 2 === 0 ? 2 + Math.random() * 2 : 4 + Math.random() * 2) : 10 + Math.random() * 6;
      
      const duration = 1.3 + Math.random() * 1.1;
      const delay = Math.random() * 1.5;
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

  // Strong Click Sparkle Explosion: 54 particles spanning 60px–320px in 360°
  const triggerClickSparkleBurst = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setBurstOrigin({ x: centerX, y: centerY });

    const newBurst: BurstParticle[] = [];
    const count = 54; // 54 particles (range 45–60)

    for (let i = 0; i < count; i++) {
      // 360° radial distribution across all directions (↖ ↑ ↗ ← BUTTON → ↙ ↓ ↘)
      const baseAngle = (i / count) * 2 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 0.35;

      // Tiered distance distribution:
      // ~30% near (60–100px)
      // ~40% medium (100–180px)
      // ~20% far (180–280px)
      // ~10% special far (280–320px)
      let distance = 80;
      const tier = i % 10;
      if (tier < 3) {
        distance = 60 + Math.random() * 40; // 60–100px
      } else if (tier < 7) {
        distance = 100 + Math.random() * 80; // 100–180px
      } else if (tier < 9) {
        distance = 180 + Math.random() * 100; // 180–280px
      } else {
        distance = 280 + Math.random() * 40; // 280–320px
      }

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 240;
      const streakAngle = (angle * 180) / Math.PI;

      let type: BurstParticle['type'] = 'dot';
      if (i % 3 === 0) type = 'star';
      else if (i % 6 === 0) type = 'streak';
      else if (i === 1 || i === 12 || i === 24 || i === 36 || i === 48) type = 'glow';

      const color = CYAN_PALETTE[Math.floor(Math.random() * CYAN_PALETTE.length)];

      // Size tiers:
      // Small: 2–3.5px
      // Medium: 4–6.5px
      // Occasional prominent sparkle: 8–13px
      let size = 3;
      if (type === 'star') {
        size = i % 4 === 0 ? 10 + Math.random() * 3 : i % 2 === 0 ? 6 + Math.random() * 2 : 4 + Math.random() * 2;
      } else if (type === 'dot') {
        size = i % 3 === 0 ? 2 + Math.random() * 1.5 : 3.5 + Math.random() * 2;
      } else if (type === 'streak') {
        size = 14 + Math.random() * 12;
      } else {
        size = 18 + Math.random() * 8;
      }

      const duration = 0.75 + Math.random() * 0.32; // 750ms - 1070ms
      const delay = Math.random() * 0.06; // 0ms - 60ms

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
    }, 1150);
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

      {/* Global Viewport Portal attached to document.body (100% immune to navbar or card clipping) */}
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
              zIndex: 9999999,
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
                ['--tx' as any]: `${p.tx.toFixed(1)}px`,
                ['--ty' as any]: `${p.ty.toFixed(1)}px`,
                ['--rot' as any]: `${p.rot.toFixed(1)}deg`,
                ['--angle' as any]: `${p.angle.toFixed(1)}deg`,
                animationDuration: `${p.duration.toFixed(2)}s`,
                animationDelay: `${p.delay.toFixed(3)}s`,
                animationTimingFunction: 'cubic-bezier(0.1, 0.85, 0.25, 1)',
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
                        filter: `drop-shadow(0 0 6px ${p.color}) drop-shadow(0 0 12px ${p.color})`,
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
                      height: '2px',
                      width: `${p.size}px`,
                      background: `linear-gradient(90deg, transparent, ${p.color}, #FFFFFF, transparent)`,
                      boxShadow: `0 0 8px ${p.color}, 0 0 14px ${p.color}`,
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
                      background: `radial-gradient(circle, ${p.color} 0%, rgba(0,210,255,0.35) 50%, rgba(0,210,255,0) 70%)`,
                      filter: 'blur(2.5px)',
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
                    boxShadow: `0 0 6px 1.5px ${p.color}, 0 0 12px 3px ${p.color}`,
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
