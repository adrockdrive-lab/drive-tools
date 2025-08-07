'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  color?: string;
  thickness?: number;
  children?: React.ReactNode;
}

const sizeConfig = {
  sm: { diameter: 60, strokeWidth: 4, fontSize: 'text-xs' },
  md: { diameter: 100, strokeWidth: 6, fontSize: 'text-sm' },
  lg: { diameter: 140, strokeWidth: 8, fontSize: 'text-lg' }
};

export function ProgressRing({ 
  progress, 
  size = 'md', 
  showValue = true, 
  animated = true,
  color = '#3B82F6',
  thickness,
  children 
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : progress);
  const config = sizeConfig[size];
  const strokeWidth = thickness || config.strokeWidth;
  const diameter = config.diameter;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: animated ? 1.5 : 0,
            type: "spring",
            stiffness: 60,
            damping: 15
          }}
          className="drop-shadow-sm"
          style={{
            filter: progress > 0 ? `drop-shadow(0 0 6px ${color}40)` : 'none'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className={`absolute inset-0 flex items-center justify-center ${config.fontSize} font-semibold`}>
        {children || (showValue && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animated ? 0.5 : 0, duration: 0.3 }}
            className="text-gray-900 dark:text-white"
          >
            {Math.round(displayProgress)}%
          </motion.span>
        ))}
      </div>
    </div>
  );
}