'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// Slide transition for mobile
const slideVariants = {
  initial: {
    x: '100%',
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: '-100%',
    opacity: 0
  }
};

const slideTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={isMobile ? slideVariants : pageVariants}
        transition={isMobile ? slideTransition : pageTransition}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Stagger animation for lists
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = '',
  delay = 0,
  staggerDelay = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function StaggerItem({ children, className = '', index = 0 }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20,
          scale: 0.95
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating animation for elements
interface FloatingProps {
  children: React.ReactNode;
  duration?: number;
  intensity?: number;
  className?: string;
}

export function Floating({ 
  children, 
  duration = 3, 
  intensity = 10,
  className = ''
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention-grabbing elements
interface PulseProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function Pulse({ 
  children, 
  scale = 1.05, 
  duration = 2,
  className = ''
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}