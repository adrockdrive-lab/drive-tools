'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Hover scale effect
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
  disabled?: boolean;
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  className = '',
  disabled = false
}: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={disabled ? {} : { scale }}
      whileTap={disabled ? {} : { scale: scale * 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Tap effect with ripple
interface TapEffectProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
}

export function TapEffect({ children, className = '', onTap }: TapEffectProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileTap={{ scale: 0.98 }}
      onTap={onTap}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Shake animation for errors
interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export function Shake({ children, trigger, className = '' }: ShakeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
}

// Bounce effect for success states
interface BounceProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export function Bounce({ children, trigger, className = '' }: BounceProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        scale: [1, 1.2, 0.9, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeOut' }
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
}

// Slide in from direction
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
  threshold?: number;
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0,
  className = '',
  threshold = 0.1
}: SlideInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const directionVariants = {
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : directionVariants[direction]}
      transition={{ 
        duration: 0.6, 
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 12
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Count up animation
interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ 
  from = 0, 
  to, 
  duration = 1, 
  className = '',
  prefix = '',
  suffix = ''
}: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ scale: 0.8 }}
      animate={isInView ? { scale: 1 } : { scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {prefix}
          <motion.span
            initial={from}
            animate={to}
            transition={{ duration, ease: 'easeOut' }}
          >
            {from}
          </motion.span>
          {suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

// Morphing icon
interface MorphIconProps {
  icon1: React.ReactNode;
  icon2: React.ReactNode;
  isToggled: boolean;
  className?: string;
}

export function MorphIcon({ icon1, icon2, isToggled, className = '' }: MorphIconProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ opacity: isToggled ? 0 : 1, scale: isToggled ? 0.8 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
      >
        {icon1}
      </motion.div>
      <motion.div
        animate={{ opacity: isToggled ? 1 : 0, scale: isToggled ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
      >
        {icon2}
      </motion.div>
    </div>
  );
}

// Magnetic effect for buttons
interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease-out' }}
    >
      {children}
    </div>
  );
}

// Parallax scroll effect
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (!isInView) return;

    const handleScroll = () => {
      const element = ref.current as HTMLElement | null;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const y = rect.top * speed;
      element.style.transform = `translateY(${y}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInView, speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}

export function Typewriter({ 
  text, 
  speed = 50, 
  className = '',
  cursor = true
}: TypewriterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span ref={ref} className={className}>
      {isInView && (
        <>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            {text.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * (speed / 1000) }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
          {cursor && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block"
            >
              |
            </motion.span>
          )}
        </>
      )}
    </motion.span>
  );
}