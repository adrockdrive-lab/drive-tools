'use client';

import { motion } from 'framer-motion';

// Spinner component with customizable colors
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = '#3B82F6', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeMap[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="60 20"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
}

// Dots loading animation
interface DotsProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Dots({ color = '#3B82F6', size = 'md', className = '' }: DotsProps) {
  const sizeMap = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { scale: 1, opacity: 1 }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeMap[size]} rounded-full`}
          style={{ backgroundColor: color }}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader
interface PulseLoaderProps {
  color?: string;
  size?: number;
  className?: string;
}

export function PulseLoader({ color = '#3B82F6', size = 40, className = '' }: PulseLoaderProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-2"
          style={{ 
            borderColor: color,
            borderWidth: 2
          }}
          animate={{
            scale: [0, 1],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.6,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

// Wave animation
interface WaveProps {
  color?: string;
  height?: number;
  className?: string;
}

export function Wave({ color = '#3B82F6', height = 4, className = '' }: WaveProps) {
  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{ 
            backgroundColor: color,
            height: height * 4
          }}
          animate={{
            scaleY: [1, 2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton loader
interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({ className = '', showImage = true, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      {showImage && (
        <motion.div
          className="w-full h-32 bg-gray-200 rounded-lg mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${100 - (index * 10)}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Progress bar with animation
interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  progress, 
  color = '#3B82F6', 
  height = 8,
  className = '',
  showPercentage = false
}: ProgressBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      </div>
      
      {showPercentage && (
        <motion.div
          className="absolute right-0 top-full mt-1 text-xs font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = '로딩 중...',
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
        flex items-center justify-center ${className}
      `}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
      >
        <PulseLoader className="mx-auto mb-4" />
        <p className="text-gray-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
}