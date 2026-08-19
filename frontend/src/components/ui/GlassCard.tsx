import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  enableTilt?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  id,
  enableTilt = true,
  onClick,
  accentColor,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!enableTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(-((y - centerY) / centerY) * 1.6);
    setRotateY(((x - centerX) / centerX) * 1.6);
    setGlarePos({ x, y, opacity: 0.09 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((previous) => ({ ...previous, opacity: 0 }));
  };

  return (
    <motion.div
      id={id}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY, y: isHovered ? -4 : 0, transformPerspective: 1200 }}
      transition={{ type: 'spring', damping: 22, stiffness: 240, mass: 0.1 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#13171F]/80 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ${
        isHovered
          ? 'border-[#00D2FF]/40 shadow-[0_12px_36px_-8px_rgba(0,210,255,0.18)]'
          : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]'
      } ${className}`}
      style={{
        boxShadow: isHovered && accentColor ? `0 14px 40px -10px ${accentColor}30` : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(360px circle at ${glarePos.x}px ${glarePos.y}px, rgba(0, 210, 255, 0.12) 0%, rgba(0, 210, 255, 0) 70%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
};
