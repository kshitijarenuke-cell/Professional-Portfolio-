import React from 'react';
import { motion } from 'framer-motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';

// Standard Editorial Motion Constants
export const MOTION_EASING = {
  power4Out: [0.16, 1, 0.3, 1] as const,
  power3Out: [0.215, 0.61, 0.355, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  spring: { type: 'spring', stiffness: 260, damping: 20, mass: 0.15 } as const,
};

// 1. Heading Mask / Clip Reveal Variants
export const headingMaskVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
    filter: 'blur(6px)',
  },
  visible: (customDelay: number = 0) => ({
    y: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.95,
      delay: customDelay,
      ease: MOTION_EASING.power4Out,
    },
  }),
};

// 2. Paragraph Viewport Entrance Variants
export const paragraphVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
    filter: 'blur(4px)',
  },
  visible: (customDelay: number = 0) => ({
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      delay: customDelay,
      ease: MOTION_EASING.power3Out,
    },
  }),
};

// 3. Card Viewport Reveal Variants (Staggered)
export const cardRevealVariants: Variants = {
  hidden: {
    y: 40,
    opacity: 0,
    scale: 0.97,
  },
  visible: (index: number = 0) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
      ease: MOTION_EASING.power4Out,
    },
  }),
};

// 4. Stagger Container Variant
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

// Reusable Masked Heading Component
interface MaskHeadingProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  tag?: 'h1' | 'h2' | 'h3';
  baseDelay?: number;
  highlightWords?: Record<string, string>;
}

export const MaskHeading: React.FC<MaskHeadingProps> = ({
  lines,
  className = '',
  lineClassName = '',
  tag = 'h2',
  baseDelay = 0,
}) => {
  const Tag = tag;

  return (
    <Tag className={`${className} select-none`}>
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden py-0.5">
          <motion.span
            className={`block ${lineClassName}`}
            variants={headingMaskVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={baseDelay + idx * 0.12}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

// Reusable Paragraph Reveal Component
interface ParagraphRevealProps extends HTMLMotionProps<'p'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ParagraphReveal: React.FC<ParagraphRevealProps> = ({
  children,
  delay = 0,
  className = '',
  ...props
}) => {
  return (
    <motion.p
      variants={paragraphVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      custom={delay}
      className={className}
      {...props}
    >
      {children}
    </motion.p>
  );
};
